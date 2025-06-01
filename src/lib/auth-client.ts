import { createAuthClient } from "better-auth/react"

function getAuthURL() {
    console.log(process.env.AUTH_URL)
    return process.env.AUTH_URL ?? "https://dash.dekcpe.link/"
}


export const authClient = createAuthClient({
    baseURL: getAuthURL(),
})

export const { signIn, signOut, signUp, useSession } = authClient