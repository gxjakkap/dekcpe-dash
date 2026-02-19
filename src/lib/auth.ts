/** biome-ignore-all lint/style/noNonNullAssertion: <> */
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins"

import { db } from "@/db"
import { account, session, user, verification } from "@/db/schema"
import { ROLES } from "./const"

console.log("Using AUTH_URL:", process.env.AUTH_URL)

export const auth = betterAuth({
	baseURL: process.env.AUTH_URL ?? "https://dash.dekcpe.link/",
	secret: process.env.AUTH_SECRET ?? "supersecretkey",
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
			tenantId: process.env.AUTH_MSFT_TENANT_ID!,
		},
	},
	plugins: [
		admin({
			defaultRole: ROLES.UNAUTHORIZED,
			adminRoles: ROLES.ADMIN,
		}),
		nextCookies(),
	],
})
