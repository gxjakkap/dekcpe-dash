import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import { auth } from "@/lib/auth"
import { ROLES } from "@/lib/const"

export type Access = "signed-out" | "banned" | "no-access" | "user" | "admin"

interface AccessUser {
	role?: string | null
	banned?: boolean | null
	banExpires?: Date | null
}

export function accessOf(user: AccessUser | undefined): Access {
	if (!user) return "signed-out"
	// same reading as better-auth's admin plugin: a ban with a past expiry no longer applies
	if (user.banned && (!user.banExpires || user.banExpires > new Date())) return "banned"
	if (user.role === ROLES.ADMIN) return "admin"
	if (user.role === ROLES.USER) return "user"
	return "no-access"
}

const ACCESS_HOME: Record<Access, string> = {
	"signed-out": "/sign-in",
	banned: "/banned",
	"no-access": "/no-access",
	user: "/d",
	admin: "/d",
}

export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }))

export async function requireAccess(allowed: Access[]) {
	const session = await getSession()
	const access = accessOf(session?.user)
	if (!allowed.includes(access)) redirect(ACCESS_HOME[access])
	return session
}

export async function requireUser(allowed: Exclude<Access, "signed-out">[] = ["user", "admin"]) {
	const session = await requireAccess(allowed)
	if (!session) redirect(ACCESS_HOME["signed-out"])
	return session
}
