"use server"

import { eq } from "drizzle-orm"
import z from "zod"
import { db } from "@/db"
import { ensurePersonalGroup, handOffGroupsOf } from "@/db/groups"
import { user } from "@/db/schema"
import { ROLES } from "@/lib/const"
import { adminProcedure } from "@/lib/server-actions"

export const setUserRole = adminProcedure
	.createServerAction()
	.input(z.object({ id: z.string(), role: z.nativeEnum(ROLES) }))
	.handler(async ({ input }) => {
		await db.update(user).set({ role: input.role }).where(eq(user.id, input.id))
		if (input.role === ROLES.USER || input.role === ROLES.ADMIN) await ensurePersonalGroup(input.id)
	})

export const deleteUser = adminProcedure
	.createServerAction()
	.input(z.object({ id: z.string() }))
	.handler(async ({ input }) => {
		await handOffGroupsOf(input.id)
		await db.delete(user).where(eq(user.id, input.id))
	})
