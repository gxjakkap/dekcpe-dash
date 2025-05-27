import z from "zod"

import { ROLES } from "@/lib/const"

export const zodUserColumn = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    role: z.enum([ROLES.UNAUTHORIZED, ROLES.USER, ROLES.ADMIN]).optional(),
})