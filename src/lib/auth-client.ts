import { createAuthClient } from "better-auth/react"


export const authClient = createAuthClient({
    baseURL: process.env.AUTH_URL ?? "https://dash.dekcpe.link/",
})

export const { signIn, signOut, signUp, useSession } = authClient