"use server"

import { eq } from "drizzle-orm"
import z from "zod"
import { db } from "@/db"
import { getOwnedLink } from "@/db/links"
import { links } from "@/db/schema"
import { CustomError } from "@/lib/errors"
import { destinationSchema } from "@/lib/links"
import { userProcedure } from "@/lib/server-actions"

async function requireOwnedLink(slug: string, userId: string) {
	const link = await getOwnedLink(slug, userId)
	if (!link) throw new CustomError("LinkNotFoundError", "This link does not exist or has been deleted.")
	return link
}

export const editShortLink = userProcedure
	.createServerAction()
	.input(z.object({ slug: z.string(), url: destinationSchema }))
	.handler(async ({ input, ctx }) => {
		const link = await requireOwnedLink(input.slug, ctx.session.user.id)
		await db.update(links).set({ url: input.url, updatedAt: new Date() }).where(eq(links.id, link.id))
	})

export const deleteShortLink = userProcedure
	.createServerAction()
	.input(z.object({ slug: z.string() }))
	.handler(async ({ input, ctx }) => {
		const link = await requireOwnedLink(input.slug, ctx.session.user.id)
		await db.update(links).set({ deletedAt: new Date() }).where(eq(links.id, link.id))
	})
