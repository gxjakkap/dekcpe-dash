import { createAuthClient } from "better-auth/react"

// no baseURL: browser uses the current origin, so it works on any host (prod, local-dash, tailnet)
export const authClient = createAuthClient()

// full reload so no client state from the old session survives
export const signOut = () =>
	authClient.signOut({
		fetchOptions: {
			onSuccess: () => {
				location.href = "/sign-in"
			},
		},
	})
