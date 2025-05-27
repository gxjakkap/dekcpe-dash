import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"

import { db } from "@/db"
import { user, session, account, verification } from "@/db/schema"
import { ROLES } from "./const"

export const auth = betterAuth({
    baseURL: process.env.AUTH_URL || "http://localhost:4000",
    secret: process.env.AUTH_SECRET || "supersecretkey",
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user,
            session,
            account,
            verification,
        },
    }),
    socialProviders: {
        microsoft: {
            clientId: process.env.AUTH_MSFT_ID!,
            clientSecret: process.env.AUTH_MSFT_SECRET!,
            tenantId: process.env.AUTH_MSFT_TENANT_ID!
        }
    },
    plugins: [
        admin({
            defaultRole: ROLES.UNAUTHORIZED,
            adminRoles: ROLES.ADMIN
        }),
        nextCookies(),
    ]
})