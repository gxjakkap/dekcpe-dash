import { createServerActionProcedure } from "zsa"
import { type Access, accessOf, getSession } from "@/lib/session"
import { AuthenticationError, ForbiddenError, PublicError } from "./errors"

/**
 * Shamelessly borrowed from gxjakkap/cc36staffapp
 *
 * Original author: beambeambeam
 */
// biome-ignore lint: <already guarded with isAllowedError>
function shapeErrors({ err }: any) {
	const isAllowedError = err instanceof PublicError
	const isDev = process.env.NODE_ENV === "development"
	if (isAllowedError || isDev) {
		console.error(err)
		return {
			// CustomError has no code; its name (e.g. SlugAlreadyExistedError) lets the client react to it
			code: err.code ?? (isAllowedError ? err.name : "ERROR"),
			message: `${!isAllowedError && isDev ? "[DEV] " : ""}${err.message}`,
		}
	}
	return {
		code: "ERROR",
		message: "Something went wrong",
	}
}

const procedureFor = (allowed: Access[]) =>
	createServerActionProcedure()
		.experimental_shapeError(shapeErrors)
		.handler(async () => {
			const session = await getSession()
			if (!session) throw new AuthenticationError()
			if (!allowed.includes(accessOf(session.user))) throw new ForbiddenError()
			return { session }
		})

export const authedProcedure = procedureFor(["no-access", "user", "admin"])
export const userProcedure = procedureFor(["user", "admin"])
export const adminProcedure = procedureFor(["admin"])
