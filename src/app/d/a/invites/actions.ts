"use server"

import { eq } from "drizzle-orm"
import z from "zod"
import { db } from "@/db"
import { invite } from "@/db/schema"
import { CustomError } from "@/lib/errors"
import { createInviteSchema } from "@/lib/invites"
import { adminProcedure } from "@/lib/server-actions"
import { generateRandomString } from "@/lib/utils"

export const createInviteCode = adminProcedure
	.createServerAction()
	.input(createInviteSchema)
	.handler(async ({ input, ctx }) => {
		const code = input.code || generateRandomString(10)

		const created = await db
			.insert(invite)
			.values({
				code,
				maxUses: input.maxUses,
				expirationDate: input.expirationDate ?? null,
				createdBy: ctx.session.user.id,
			})
			.onConflictDoNothing({ target: invite.code })
			.returning()

		if (created.length < 1) {
			throw new CustomError(
				"InviteCodeDuplicationError",
				`Invite Code ${code} already existed! (For the off chance that it's an auto-generated and it collided then just try again.)`
			)
		}

		return { code }
	})

export const deleteInviteCode = adminProcedure
	.createServerAction()
	.input(z.object({ code: z.string() }))
	.handler(async ({ input }) => {
		const [deleted] = await db.delete(invite).where(eq(invite.code, input.code)).returning()
		if (!deleted) throw new CustomError("InviteCodeNotFoundError", `Invite Code ${input.code} not found!`)
	})
