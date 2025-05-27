import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"


export default async function SignInLayout({ children }: Readonly<{ children: React.ReactNode }>) {

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (session){
        redirect("/d")
    }

    return (
        <>
            {children}
        </>
    )
}
