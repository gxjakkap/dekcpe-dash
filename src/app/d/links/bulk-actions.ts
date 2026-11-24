"use server"

import { and, eq, inArray, isNull } from "drizzle-orm"
import z from "zod"
import { db } from "@/db"
import { accessibleLiveLinks } from "@/db/links"
import { groupMembers, groups, links } from "@/db/schema"
import { CustomError } from "@/lib/errors"
import { userProcedure } from "@/lib/server-actions"

const slugs = z.array(z.string().min(1)).min(1).max(500)

const notAllowed = () => new CustomError("LinkNotFoundError", "Some of these links do not exist or have been deleted.")

export const bulkMoveLinks = userProcedure
	.createServerAction()
	.input(z.object({ slugs, groupId: z.number().int().positive() }))
	.handler(async ({ input, ctx }) => {
		const userId = ctx.session.user.id
		const wanted = [...new Set(input.slugs)]
		// all-or-nothing: throwing inside the transaction rolls the update back
		await db.transaction(async (tx) => {
			// FOR SHARE keeps the target live and the caller a member until the update commits
			const [target] = await tx
				.select({ id: groups.id })
				.from(groups)
				.innerJoin(groupMembers, and(eq(groupMembers.groupId, groups.id), eq(groupMembers.userId, userId)))
				.where(and(eq(groups.id, input.groupId), isNull(groups.deletedAt)))
				.for("share")
			if (!target) throw new CustomError("GroupNotFoundError", "You are not a member of that group.")
			const moved = await tx
				.update(links)
				.set({ groupId: input.groupId, updatedAt: new Date() })
				.where(and(inArray(links.slug, wanted), accessibleLiveLinks(userId)))
				.returning({ id: links.id })
			if (moved.length !== wanted.length) throw notAllowed()
		})
		return { count: wanted.length }
	})

export const bulkDeleteLinks = userProcedure
	.createServerAction()
	.input(z.object({ slugs }))
	.handler(async ({ input, ctx }) => {
		const wanted = [...new Set(input.slugs)]
		await db.transaction(async (tx) => {
			const deleted = await tx
				.update(links)
				.set({ deletedAt: new Date() })
				.where(and(inArray(links.slug, wanted), accessibleLiveLinks(ctx.session.user.id)))
				.returning({ id: links.id })
			if (deleted.length !== wanted.length) throw notAllowed()
		})
		return { count: wanted.length }
	})
