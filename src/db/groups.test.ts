import { afterAll, describe, expect, test } from "bun:test"
import { and, eq, inArray, like } from "drizzle-orm"
import { db } from "@/db"
import {
	addMember,
	createGroup,
	ensurePersonalGroup,
	getMembership,
	handOffGroupsOf,
	removeMember,
	restoreGroup,
	softDeleteGroup,
	takeOwnership,
	transferOwnership,
} from "@/db/groups"
import { getAccessibleLink } from "@/db/links"
import { groupMembers, groups, links, user } from "@/db/schema"

// imports above don't connect; this throws before the first query
if (!process.env.PG_DBNAME?.endsWith("_test")) throw new Error("refusing to run: PG_DBNAME must end with _test")

const P = `test-${crypto.randomUUID().slice(0, 8)}`
let n = 0

async function newUser(name = "user") {
	const id = `${P}-${++n}`
	await db.insert(user).values({ id, name, email: `${id}@example.test`, role: "user" })
	return id
}

async function newLink(groupId: number, createdBy: string, deletedAt: Date | null = null) {
	const slug = `${P}-${++n}`
	await db.insert(links).values({ slug, url: "https://example.test", groupId, createdBy, deletedAt })
	return slug
}

const groupOf = async (id: number) => (await db.select().from(groups).where(eq(groups.id, id)))[0]
const linkOf = async (slug: string) => (await db.select().from(links).where(eq(links.slug, slug)))[0]
const isMember = async (groupId: number, userId: string) =>
	(
		await db
			.select()
			.from(groupMembers)
			.where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
	).length > 0

afterAll(async () => {
	const ids = db
		.select({ id: groupMembers.groupId })
		.from(groupMembers)
		.where(like(groupMembers.userId, `${P}-%`))
	await db.delete(links).where(inArray(links.groupId, ids))
	await db.delete(groups).where(inArray(groups.id, ids))
	await db.delete(user).where(like(user.id, `${P}-%`))
})

describe("groups", () => {
	test("links are accessible through live membership only", async () => {
		const owner = await newUser()
		const other = await newUser()
		const g = await createGroup("G", owner)
		const slug = await newLink(g, owner)

		expect(await getAccessibleLink(slug, owner)).toBeDefined()
		expect(await getAccessibleLink(slug, other)).toBeUndefined()
		expect((await getMembership(g, owner))?.isOwner).toBe(true)

		await addMember(g, other)
		expect(await getAccessibleLink(slug, other)).toBeDefined()
		expect((await getMembership(g, other))?.isOwner).toBe(false)
		await expect(addMember(g, other)).rejects.toThrow("already a member")

		await softDeleteGroup(g)
		expect(await getAccessibleLink(slug, owner)).toBeUndefined()
		expect(await getAccessibleLink(slug, other)).toBeUndefined()
		expect(await getMembership(g, owner)).toBeUndefined()
	})

	test("removeMember refuses the owner", async () => {
		const owner = await newUser()
		const member = await newUser()
		const g = await createGroup("G", owner)
		await addMember(g, member)

		await expect(removeMember(g, owner)).rejects.toThrow("owner can't be removed")
		await removeMember(g, member)
		expect(await isMember(g, member)).toBe(false)
		expect(await isMember(g, owner)).toBe(true)
	})

	test("transferOwnership only goes to a member", async () => {
		const owner = await newUser()
		const outsider = await newUser()
		const g = await createGroup("G", owner)

		await expect(transferOwnership(g, outsider)).rejects.toThrow("member")
		expect((await groupOf(g)).ownerId).toBe(owner)

		await addMember(g, outsider)
		await transferOwnership(g, outsider)
		expect((await groupOf(g)).ownerId).toBe(outsider)
		expect(await isMember(g, owner)).toBe(true)
	})

	test("restore brings back only links deleted with the group", async () => {
		const owner = await newUser()
		const admin = await newUser()
		const g = await createGroup("G", owner)
		const live = await newLink(g, owner)
		const earlier = await newLink(g, owner, new Date("2025-01-01"))

		await softDeleteGroup(g)
		const deletedAt = (await groupOf(g)).deletedAt
		expect(deletedAt).not.toBeNull()
		expect((await linkOf(live)).deletedAt).toEqual(deletedAt)
		await expect(softDeleteGroup(g)).rejects.toThrow()

		await restoreGroup(g, admin)
		expect((await groupOf(g)).deletedAt).toBeNull()
		expect((await groupOf(g)).ownerId).toBe(owner)
		expect(await isMember(g, admin)).toBe(false)
		expect((await linkOf(live)).deletedAt).toBeNull()
		expect((await linkOf(earlier)).deletedAt).toEqual(new Date("2025-01-01"))
		await expect(restoreGroup(g, admin)).rejects.toThrow()
	})

	test("takeOwnership keeps the old owner as a member", async () => {
		const owner = await newUser()
		const admin = await newUser()
		const g = await createGroup("G", owner)

		await takeOwnership(g, admin)
		expect((await groupOf(g)).ownerId).toBe(admin)
		expect(await isMember(g, admin)).toBe(true)
		expect(await isMember(g, owner)).toBe(true)

		await softDeleteGroup(g)
		await expect(takeOwnership(g, owner)).rejects.toThrow()
	})

	test("handOffGroupsOf passes groups to the earliest-joined member", async () => {
		const owner = await newUser()
		const later = await newUser()
		const earliest = await newUser()
		const g = await createGroup("G", owner)
		// inserted out of order so the pick has to come from joinedAt
		await db.insert(groupMembers).values([
			{ groupId: g, userId: later, joinedAt: new Date("2025-03-01") },
			{ groupId: g, userId: earliest, joinedAt: new Date("2025-02-01") },
		])

		await handOffGroupsOf(owner)
		expect((await groupOf(g)).ownerId).toBe(earliest)
		expect((await groupOf(g)).deletedAt).toBeNull()
	})

	test("a solo group is soft-deleted on hand-off and restore makes the admin its owner", async () => {
		const owner = await newUser()
		const admin = await newUser()
		const g = await createGroup("Solo", owner)
		const slug = await newLink(g, owner)

		await handOffGroupsOf(owner)
		expect((await groupOf(g)).deletedAt).not.toBeNull()
		expect((await linkOf(slug)).deletedAt).not.toBeNull()

		await db.delete(user).where(eq(user.id, owner))
		expect((await groupOf(g)).ownerId).toBeNull()
		expect((await linkOf(slug)).createdBy).toBeNull()

		await restoreGroup(g, admin)
		expect((await groupOf(g)).ownerId).toBe(admin)
		expect(await isMember(g, admin)).toBe(true)
		expect((await linkOf(slug)).deletedAt).toBeNull()
	})

	test("ensurePersonalGroup is idempotent", async () => {
		const id = await newUser("Personal Pat")
		await ensurePersonalGroup(id)
		await ensurePersonalGroup(id)

		const mine = await db
			.select({ name: groups.name, ownerId: groups.ownerId })
			.from(groups)
			.innerJoin(groupMembers, eq(groupMembers.groupId, groups.id))
			.where(eq(groupMembers.userId, id))
		expect(mine).toEqual([{ name: "Personal Pat", ownerId: id }])
	})
})
