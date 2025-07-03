"use server"

import { db } from "@/db"
import { links } from "@/db/schema"
import { CustomError } from "@/lib/errors"
import { authorizedProcedure } from "@/lib/server-actions"
import { eq } from "drizzle-orm"
import z from "zod"

export const editShortLink = authorizedProcedure
    .createServerAction()
    .input(z.object({
        url: z.string()
            .regex(/^https?:\/\/[^\s<>"]+$/, "Destination URL must be valid."),
        slug: z.string()
    }))
    .handler(async({ input, ctx }) => {
        const { url, slug } = input
        
        const [link] = await db.select().from(links).where(eq(links.slug, slug)).limit(1)
        if (!link) throw new CustomError("LinkNotFoundError", "This link does not exist or has been deleted.")
        if (link.owner !== ctx.session.user.id) {
            throw new CustomError("UnauthorizedError", "You are not authorized to edit this link.")
        }
        if (link.deletedAt) {
            throw new CustomError("LinkNotExistedError", "This link does not exist or has been deleted.")
        }
        
        await db.update(links)
            .set({
                url: url,
                updatedAt: new Date()
            })
            .where(eq(links.slug, slug))
            

        return {
            status: 200
        }
    })