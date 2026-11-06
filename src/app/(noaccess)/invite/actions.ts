"use server"

import dayjs from "dayjs"
import { eq } from "drizzle-orm"
import z from "zod"
import { db } from "@/db"
import { invite, inviteUsage, user } from "@/db/schema"
import { ROLES } from "@/lib/const"
import { authedProcedure } from "@/lib/server-actions"
import { RedeemInviteCodeStatus } from "./types"

export const redeemInviteCode = authedProcedure
	.createServerAction()
	.input(
		z.object({
			code: z
				.string({ message: "Invite code must be a string" })
				.min(3, { message: "Invite codes are at least 3 characters." }),
		})
	)
	.handler(async ({ input, ctx }) => {
		const { code } = input
		const { session } = ctx

		const [res] = await db.select().from(invite).where(eq(invite.code, code)).limit(1)

		if (!res) {
			return {
				status: RedeemInviteCodeStatus.INVALID,
				code: code,
			}
		}

		const exp = dayjs(res.expirationDate)
		const now = dayjs()

		if (res.expirationDate && exp.isBefore(now)) {
			return {
				status: RedeemInviteCodeStatus.EXPIRED,
				code: code,
			}
		}

		const usesRes = await db.select().from(inviteUsage).where(eq(inviteUsage.inviteId, res.id))

		if (res.maxUses !== -1 && usesRes.length >= res.maxUses) {
			return {
				status: RedeemInviteCodeStatus.MAX_USED,
				code: code,
			}
		}

		const [uRes] = await db
			.select({ id: user.id, role: user.role })
			.from(user)
			.where(eq(user.id, session.user.id))
			.limit(1)

		if (uRes.role !== ROLES.UNAUTHORIZED) {
			return {
				status: RedeemInviteCodeStatus.UNNECESSARY,
				code: code,
			}
		}

		await db.update(user).set({ role: ROLES.USER }).where(eq(user.id, uRes.id))
		await db.insert(inviteUsage).values({ inviteId: res.id, userId: session.user.id })

		return {
			status: RedeemInviteCodeStatus.OK,
			code: code,
		}
	})
