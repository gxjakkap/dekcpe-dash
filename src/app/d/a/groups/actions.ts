"use server"

import z from "zod"
import { restoreGroup, takeOwnership } from "@/db/groups"
import { adminProcedure } from "@/lib/server-actions"

const input = z.object({ groupId: z.number().int().positive() })

export const takeOwnershipAction = adminProcedure
	.createServerAction()
	.input(input)
	.handler(async ({ input, ctx }) => takeOwnership(input.groupId, ctx.session.user.id))

export const restoreGroupAction = adminProcedure
	.createServerAction()
	.input(input)
	.handler(async ({ input, ctx }) => restoreGroup(input.groupId, ctx.session.user.id))
