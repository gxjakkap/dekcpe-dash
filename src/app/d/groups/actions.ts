"use server"

import { sql } from "drizzle-orm"
import z from "zod"
import { db } from "@/db"
import {
	addMember,
	createGroup,
	getMembership,
	removeMember,
	renameGroup,
	softDeleteGroup,
	transferOwnership,
} from "@/db/groups"
import { user } from "@/db/schema"
import { CustomError } from "@/lib/errors"
import { groupNameSchema } from "@/lib/groups"
import { userProcedure } from "@/lib/server-actions"
import { accessOf } from "@/lib/session"

const groupId = z.number().int().positive()

/** the caller's membership of a live group; non-members get the same error as a missing group */
async function membership(id: number, userId: string, ownerOnly: boolean) {
	const m = await getMembership(id, userId)
	if (!m) throw new CustomError("GroupNotFoundError", "This group does not exist or has been deleted.")
	if (ownerOnly && !m.isOwner) throw new CustomError("NotOwnerError", "Only the group owner can do this.")
	return m
}

export const createGroupAction = userProcedure
	.createServerAction()
	.input(z.object({ name: groupNameSchema }))
	.handler(async ({ input, ctx }) => ({ id: await createGroup(input.name, ctx.session.user.id) }))

export const renameGroupAction = userProcedure
	.createServerAction()
	.input(z.object({ groupId, name: groupNameSchema }))
	.handler(async ({ input, ctx }) => {
		await membership(input.groupId, ctx.session.user.id, true)
		await renameGroup(input.groupId, input.name)
	})

export const addMemberAction = userProcedure
	.createServerAction()
	.input(z.object({ groupId, email: z.string().trim().min(1, { message: "Enter an email." }) }))
	.handler(async ({ input, ctx }) => {
		await membership(input.groupId, ctx.session.user.id, true)
		const [target] = await db.select().from(user).where(sql`lower(${user.email}) = lower(${input.email})`)
		if (!target) throw new CustomError("UserNotFoundError", `No user with the email ${input.email}.`)
		if (!["user", "admin"].includes(accessOf(target))) {
			throw new CustomError("UserNoAccessError", "This user doesn't have access to the dashboard.")
		}
		await addMember(input.groupId, target.id)
	})

export const removeMemberAction = userProcedure
	.createServerAction()
	.input(z.object({ groupId, userId: z.string() }))
	.handler(async ({ input, ctx }) => {
		await membership(input.groupId, ctx.session.user.id, true)
		await removeMember(input.groupId, input.userId)
	})

export const transferOwnershipAction = userProcedure
	.createServerAction()
	.input(z.object({ groupId, userId: z.string() }))
	.handler(async ({ input, ctx }) => {
		await membership(input.groupId, ctx.session.user.id, true)
		await transferOwnership(input.groupId, input.userId)
	})

export const leaveGroupAction = userProcedure
	.createServerAction()
	.input(z.object({ groupId }))
	.handler(async ({ input, ctx }) => {
		await membership(input.groupId, ctx.session.user.id, false)
		await removeMember(input.groupId, ctx.session.user.id) // refuses the owner
	})

export const deleteGroupAction = userProcedure
	.createServerAction()
	.input(z.object({ groupId }))
	.handler(async ({ input, ctx }) => {
		await membership(input.groupId, ctx.session.user.id, true)
		await softDeleteGroup(input.groupId)
	})
