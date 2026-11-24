"use server"

import { and, eq, inArray, isNull } from "drizzle-orm"
import z from "zod"
import { db } from "@/db"
import { groups, links } from "@/db/schema"
import { CustomError } from "@/lib/errors"
import { adminProcedure } from "@/lib/server-actions"

const slugs = z.array(z.string().min(1)).min(1).max(500)

const notAllowed = () => new CustomError("LinkNotFoundError", "Some of these links do not exist or have been deleted.")

export const adminBulkMoveLinks = adminProcedure
	.createServerAction()
	.input(z.object({ slugs, groupId: z.number().int().positive() }))
	.handler(async ({ input }) => {
		const wanted = [...new Set(input.slugs)]
		// all-or-nothing: throwing inside the transaction rolls everything back
		await db.transaction(async (tx) => {
			const [group] = await tx
				.select({ id: groups.id })
				.from(groups)
				.where(and(eq(groups.id, input.groupId), isNull(groups.deletedAt)))
			if (!group) throw new CustomError("GroupNotFoundError", "This group does not exist or has been deleted.")
			const moved = await tx
				.update(links)
				.set({ groupId: input.groupId, updatedAt: new Date() })
				.where(and(inArray(links.slug, wanted), isNull(links.deletedAt)))
				.returning({ id: links.id })
			if (moved.length !== wanted.length) throw notAllowed()
		})
		return { count: wanted.length }
	})

export const adminBulkDeleteLinks = adminProcedure
	.createServerAction()
	.input(z.object({ slugs }))
	.handler(async ({ input }) => {
		const wanted = [...new Set(input.slugs)]
		await db.transaction(async (tx) => {
			const deleted = await tx
				.update(links)
				.set({ deletedAt: new Date() })
				.where(and(inArray(links.slug, wanted), isNull(links.deletedAt)))
				.returning({ id: links.id })
			if (deleted.length !== wanted.length) throw notAllowed()
		})
		return { count: wanted.length }
	})
