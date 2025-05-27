"use server"

import { eq } from "drizzle-orm"
import z from "zod"

import { db } from "@/db"
import { user } from "@/db/schema"
import { adminProcedure } from "@/lib/server-actions"
import { zodUserColumn } from "./types"

export const updateUser = adminProcedure
    .createServerAction()
    .input(z.object({
        id: z.string(),
        data: zodUserColumn.partial()
    }))
    .handler(async({ input }) => {
        await db.update(user).set(input.data).where(eq(user.id, input.id))
    })

export const deleteUser = adminProcedure
    .createServerAction()
    .input(z.object({
        id: z.string()
    }))
    .handler(async({ input }) => {
        await db.delete(user).where(eq(user.id, input.id))
    })