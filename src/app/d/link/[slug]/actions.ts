"use server"

import { db } from "@/db"
import { links } from "@/db/schema"
import { ROLES } from "@/lib/const"
import { CustomError } from "@/lib/errors"
import { authorizedProcedure } from "@/lib/server-actions"
import { eq } from "drizzle-orm"
import z from "zod"

export const deleteShortLink = authorizedProcedure
    .createServerAction()
    .input(z.object({
        slug: z.string()
    }))
    .handler(async({ input, ctx }) => {
        const { slug } = input
        
        const [link] = await db.select().from(links).where(eq(links.slug, slug)).limit(1)
        if (!link) throw new CustomError("LinkNotFoundError", "This link does not exist or has been deleted.")
        if ((link.owner !== ctx.session.user.id) && (ctx.session.user.role !== ROLES.ADMIN)) {
            throw new CustomError("UnauthorizedError", "You are not authorized to delete this link.")
        }
        if (link.deletedAt) {
            throw new CustomError("LinkNotExistedError", "This link does not exist or has already been deleted.")
        }
        
        await db.update(links)
            .set({
                deletedAt: new Date()
            })
            .where(eq(links.slug, slug))
            
        return {
            status: 200
        }
    })