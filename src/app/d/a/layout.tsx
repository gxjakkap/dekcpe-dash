import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { ROLES } from "@/lib/const"

export default async function AdminLayout({ children }: { children: React.ReactNode }){
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (session?.user.role !== ROLES.ADMIN){
        redirect("/d")
    }

    return (
        <>
            {children}
        </>
    )
}