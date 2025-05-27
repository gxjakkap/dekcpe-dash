import { createAuthClient } from "better-auth/react"

const getBaseURL = () => {
  const url = process.env.AUTH_URL || "http://localhost:4000";
  
  try {
    new URL(url);
    return url;
  } 
  catch {
    return "http://localhost:4000"
  }
}

export const authClient = createAuthClient({
    baseURL: getBaseURL(),
})

export const { signIn, signOut, signUp, useSession } = authClient