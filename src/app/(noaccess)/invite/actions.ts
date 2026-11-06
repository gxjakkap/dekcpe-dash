"use server"

import { count, eq } from "drizzle-orm"
import z from "zod"
import { db } from "@/db"
import { invite, inviteUsage, user } from "@/db/schema"
import { ROLES } from "@/lib/const"
import { CustomError } from "@/lib/errors"
import { redeemCodeSchema, UNLIMITED_USES } from "@/lib/invites"
import { authedProcedure } from "@/lib/server-actions"
import { accessOf } from "@/lib/session"

export const redeemInviteCode = authedProcedure
	.createServerAction()
	.input(z.object({ code: redeemCodeSchema }))
	.handler(async ({ input: { code }, ctx: { session } }) => {
		const [inv] = await db.select().from(invite).where(eq(invite.code, code)).limit(1)
		if (!inv) {
			throw new CustomError("InviteCodeInvalidError", `${code} isn't a valid invite code. Check it and try again.`)
		}
		if (inv.expirationDate && inv.expirationDate < new Date()) {
			throw new CustomError("InviteCodeExpiredError", `${code} has expired.`)
		}

		const [{ uses }] = await db.select({ uses: count() }).from(inviteUsage).where(eq(inviteUsage.inviteId, inv.id))
		if (inv.maxUses !== UNLIMITED_USES && uses >= inv.maxUses) {
			throw new CustomError("InviteCodeUsedUpError", `${code} has been used the maximum number of times.`)
		}

		if (accessOf(session.user) !== "no-access") return { alreadyHadAccess: true }

		await db.update(user).set({ role: ROLES.USER }).where(eq(user.id, session.user.id))
		await db.insert(inviteUsage).values({ inviteId: inv.id, userId: session.user.id })

		return { alreadyHadAccess: false }
	})
