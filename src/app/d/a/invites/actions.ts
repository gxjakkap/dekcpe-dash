"use server"

import { db } from "@/db"
import { invite } from "@/db/schema"
import { CustomError } from "@/lib/errors"
import { adminProcedure } from "@/lib/server-actions"
import { generateRandomString } from "@/lib/utils"
import { eq } from "drizzle-orm"
import z from "zod"

export const createInviteCode = adminProcedure
    .createServerAction()
    .input(z.object({
        code: z.string().length(0, { message: "Custom invite code must be at least 4 characters long" }).or(z.string().min(4, { message: "Custom invite code must be at least 4 characters long" })).optional(),
        maxUses: z.number().min(-1).max(-1).or(z.number().min(1).max(9999)).default(1).optional(),
        expirationDate: z.date().optional()
    }))
    .handler(async({ input, ctx }) => {
        let inv = input.code

        if (!inv || inv.length === 0){
            inv = generateRandomString(10)
        }

        const res = await db.insert(invite).values({ code: inv, maxUses: input.maxUses, expirationDate: input.expirationDate ?? null, createdBy: ctx.session.user.id }).onConflictDoNothing({ target: invite.code }).returning()

        if (res.length < 1){
            throw new CustomError("InviteCodeDuplicationError", `Invite Code ${inv} already existed! (For the off chance that it's an auto-generated and it collided then just try again.)`)
        }

        return {
            status: 201,
            code: inv
        }
    })

export const deleteInviteCode = adminProcedure
    .createServerAction()
    .input(z.object({
        code: z.string().min(4)
    }))
    .handler(async({ input }) => {
        const [res] = await db.delete(invite).where(eq(invite.code, input.code)).returning()

        if (!res) {
            throw new CustomError("InviteCodeNotFoundError", `Invite Code ${input.code} not found!`)
        }

        return
    })