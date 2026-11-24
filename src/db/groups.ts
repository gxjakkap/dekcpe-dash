import { and, asc, eq, isNotNull, isNull, ne, sql } from "drizzle-orm"
import { db } from "@/db"
import { groupMembers, groups, links, user } from "@/db/schema"
import { CustomError } from "@/lib/errors"

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

const groupNotFound = () => new CustomError("GroupNotFoundError", "This group does not exist or has been deleted.")

/** ids of the live groups the user belongs to, as a subquery for `inArray(...)` */
export const memberGroupIds = (userId: string) =>
	db
		.select({ id: groupMembers.groupId })
		.from(groupMembers)
		.innerJoin(groups, eq(groups.id, groupMembers.groupId))
		.where(and(eq(groupMembers.userId, userId), isNull(groups.deletedAt)))

export async function getMembership(groupId: number, userId: string) {
	const [row] = await db
		.select({ group: groups })
		.from(groups)
		.innerJoin(groupMembers, and(eq(groupMembers.groupId, groups.id), eq(groupMembers.userId, userId)))
		.where(and(eq(groups.id, groupId), isNull(groups.deletedAt)))
		.limit(1)
	return row && { group: row.group, isOwner: row.group.ownerId === userId }
}

export const createGroup = (name: string, ownerId: string) =>
	db.transaction(async (tx) => {
		const [group] = await tx.insert(groups).values({ name, ownerId }).returning({ id: groups.id })
		await tx.insert(groupMembers).values({ groupId: group.id, userId: ownerId })
		return group.id
	})

/** gives the user a group named after them, unless they already belong to one (even a deleted one) */
export async function ensurePersonalGroup(userId: string) {
	const [row] = await db
		.select({ name: user.name, membership: groupMembers.groupId })
		.from(user)
		.leftJoin(groupMembers, eq(groupMembers.userId, user.id))
		.where(eq(user.id, userId))
		.limit(1)
	if (row && row.membership === null) await createGroup(row.name, userId)
}

export async function addMember(groupId: number, userId: string) {
	const added = await db.insert(groupMembers).values({ groupId, userId }).onConflictDoNothing().returning()
	if (added.length < 1) throw new CustomError("AlreadyMemberError", "This user is already a member of the group.")
}

export async function removeMember(groupId: number, userId: string) {
	const [group] = await db.select({ ownerId: groups.ownerId }).from(groups).where(eq(groups.id, groupId))
	if (!group) throw groupNotFound()
	if (group.ownerId === userId) {
		throw new CustomError(
			"OwnerCannotLeaveError",
			"The owner can't be removed. Transfer ownership or delete the group."
		)
	}
	await db.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
}

export async function transferOwnership(groupId: number, toUserId: string) {
	const [member] = await db
		.select()
		.from(groupMembers)
		.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, toUserId)))
	if (!member) throw new CustomError("NotAMemberError", "Ownership can only go to a member of the group.")
	await db.update(groups).set({ ownerId: toUserId }).where(eq(groups.id, groupId))
}

export async function renameGroup(groupId: number, name: string) {
	await db.update(groups).set({ name }).where(eq(groups.id, groupId))
}

// one timestamp for the group and its live links, so restore can tell them apart from links deleted earlier
async function softDelete(tx: Tx, groupId: number) {
	const now = new Date()
	const deleted = await tx
		.update(groups)
		.set({ deletedAt: now })
		.where(and(eq(groups.id, groupId), isNull(groups.deletedAt)))
		.returning({ id: groups.id })
	if (deleted.length < 1) throw groupNotFound()
	await tx
		.update(links)
		.set({ deletedAt: now })
		.where(and(eq(links.groupId, groupId), isNull(links.deletedAt)))
}

export const softDeleteGroup = (groupId: number) => db.transaction((tx) => softDelete(tx, groupId))

export const takeOwnership = (groupId: number, adminId: string) =>
	db.transaction(async (tx) => {
		const taken = await tx
			.update(groups)
			.set({ ownerId: adminId })
			.where(and(eq(groups.id, groupId), isNull(groups.deletedAt)))
			.returning({ id: groups.id })
		if (taken.length < 1) throw groupNotFound()
		await tx.insert(groupMembers).values({ groupId, userId: adminId }).onConflictDoNothing()
	})

export const restoreGroup = (groupId: number, adminId: string) =>
	db.transaction(async (tx) => {
		const [group] = await tx
			.select({ ownerId: groups.ownerId })
			.from(groups)
			.where(and(eq(groups.id, groupId), isNotNull(groups.deletedAt)))
		if (!group) throw new CustomError("GroupNotDeletedError", "This group does not exist or is not deleted.")

		// compared in SQL: postgres keeps microseconds, a JS Date would round them off
		await tx
			.update(links)
			.set({ deletedAt: null })
			.where(
				and(
					eq(links.groupId, groupId),
					eq(links.deletedAt, sql`(select ${groups.deletedAt} from ${groups} where ${groups.id} = ${groupId})`)
				)
			)
		await tx
			.update(groups)
			.set({ deletedAt: null, ownerId: group.ownerId ?? adminId })
			.where(eq(groups.id, groupId))
		if (!group.ownerId) await tx.insert(groupMembers).values({ groupId, userId: adminId }).onConflictDoNothing()
	})

/** call before deleting a user: their live groups pass to the longest-standing other member, or are deleted */
export const handOffGroupsOf = (userId: string) =>
	db.transaction(async (tx) => {
		const owned = await tx
			.select({ id: groups.id })
			.from(groups)
			.where(and(eq(groups.ownerId, userId), isNull(groups.deletedAt)))
		for (const { id } of owned) {
			const [next] = await tx
				.select({ userId: groupMembers.userId })
				.from(groupMembers)
				.where(and(eq(groupMembers.groupId, id), ne(groupMembers.userId, userId)))
				.orderBy(asc(groupMembers.joinedAt))
				.limit(1)
			if (next) await tx.update(groups).set({ ownerId: next.userId }).where(eq(groups.id, id))
			else await softDelete(tx, id)
		}
	})
