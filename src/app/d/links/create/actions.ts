"use server"

import * as Crypto from "node:crypto"
import { eq } from "drizzle-orm"
import z from "zod"
import { db } from "@/db"
import { links } from "@/db/schema"
import { CustomError } from "@/lib/errors"
import { authorizedProcedure } from "@/lib/server-actions"

const RANDOM_SLUG_LENGTH = 8

export const createShortLink = authorizedProcedure
	.createServerAction()
	.input(
		z.object({
			slug: z
				.string()
				.length(0)
				.or(
					z
						.string()
						.min(4, { message: "Slug must be at least 4 characters." })
						.regex(/^[a-zA-Z0-9_-]+$/, "Slug can only contain letters, numbers, hyphens, and underscores.")
				)
				.optional(),
			url: z.string().regex(/^https?:\/\/[^\s<>"]+$/, "Enter a full URL that starts with http:// or https://"),
		})
	)
	.handler(async ({ input, ctx }) => {
		const { slug, url } = input
		let sl = slug
		if (sl && sl.length > 0) {
			const [l] = await db.select().from(links).where(eq(links.slug, sl)).limit(1)
			if (l) throw new CustomError("SlugAlreadyExistedError", "That slug is already taken. Try a different one.")
		} else {
			const buf = Crypto.randomBytes(Math.floor((RANDOM_SLUG_LENGTH * 3) / 4))
			sl = buf.toString("base64url")
		}

		await db.insert(links).values({
			slug: sl,
			url: url,
			owner: ctx.session.user.id,
		})

		return {
			status: 201,
			link: new URL(sl, process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL || "https://dekcpe.link/").toString(),
		}
	})
