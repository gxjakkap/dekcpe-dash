"use server"

import * as Crypto from "node:crypto"
import z from "zod"
import { db } from "@/db"
import { getMembership } from "@/db/groups"
import { links } from "@/db/schema"
import { CustomError } from "@/lib/errors"
import { destinationSchema, SLUG_TAKEN, shortLinkUrl, slugSchema } from "@/lib/links"
import { userProcedure } from "@/lib/server-actions"

const RANDOM_SLUG_LENGTH = 8

export const createShortLink = userProcedure
	.createServerAction()
	.input(z.object({ slug: slugSchema, url: destinationSchema, groupId: z.number().int() }))
	.handler(async ({ input, ctx }) => {
		if (!(await getMembership(input.groupId, ctx.session.user.id))) {
			throw new CustomError("GroupNotFoundError", "You are not a member of that group.")
		}
		const slug = input.slug || Crypto.randomBytes(Math.floor((RANDOM_SLUG_LENGTH * 3) / 4)).toString("base64url")

		const created = await db
			.insert(links)
			.values({ slug, url: input.url, groupId: input.groupId, createdBy: ctx.session.user.id })
			.onConflictDoNothing({ target: links.slug })
			.returning()

		if (created.length < 1) {
			throw new CustomError(SLUG_TAKEN, "That slug is already taken. Try a different one.")
		}

		return { link: shortLinkUrl(slug) }
	})
