import { headers } from "next/headers"
import { createServerActionProcedure } from "zsa"
import { auth } from "@/lib/auth"
import { ROLES } from "./const"
import { AuthenticationError, ForbiddenError, PublicError } from "./errors"

/**
 * Shamelessly borrowed from gxjakkap/cc36staffapp
 *
 * Original author: beambeambeam
 */
// biome-ignore lint: <already guarded with isAllowedError>
export function shapeErrors({ err }: any) {
	const isAllowedError = err instanceof PublicError
	const isDev = process.env.NODE_ENV === "development"
	if (err instanceof PublicError || isDev) {
		console.error(err)
		return {
			code: err.code ?? "ERROR",
			message: `${!isAllowedError && isDev ? "[DEV] " : ""}${err.message}`,
		}
	} else {
		return {
			code: "ERROR",
			message: "Something went wrong",
		}
	}
}

export const authedProcedure = createServerActionProcedure()
	.experimental_shapeError(shapeErrors)
	.handler(async () => {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session) throw new AuthenticationError()

		return {
			session,
		}
	})

export const authorizedProcedure = createServerActionProcedure(authedProcedure)
	.experimental_shapeError(shapeErrors)
	.handler(async ({ ctx }) => {
		if (ctx.session.user.role === ROLES.UNAUTHORIZED) throw new ForbiddenError()

		return {
			session: ctx.session,
		}
	})

export const adminProcedure = createServerActionProcedure(authedProcedure)
	.experimental_shapeError(shapeErrors)
	.handler(async ({ ctx }) => {
		const isAdmin = ctx.session?.user.role === ROLES.ADMIN

		if (!isAdmin) throw new ForbiddenError()

		return {
			session: ctx.session,
		}
	})
