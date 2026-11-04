import { createAuthClient } from "better-auth/react"

// no baseURL: browser uses the current origin, so it works on any host (prod, local-dash, tailnet)
export const authClient = createAuthClient()

export const { signIn, signOut, signUp, useSession } = authClient
