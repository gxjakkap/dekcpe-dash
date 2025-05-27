import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { db } from "@/db"
import { user } from "@/db/schema"
import { auth } from "@/lib/auth"
import { AdminUserTable, UserColumn } from "@/components/table/admin-users-table"

export default async function CreateLinkPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session){
        redirect("/sign-in")
    }

    const users = await db.select().from(user)

    const usersData: UserColumn[] = users.map(x => {
        return {
            id: x.id,
            name: x.name,
            email: x.email,
            role: x.role,
            banned: x.banned,
            banReason: x.banReason
        }
    })

    console.log(usersData)

    return (
        <div className="flex flex-col min-h-screen w-full pt-4">
            <h3 className="text-3xl">Users</h3>
            <AdminUserTable
                data={usersData}
            />
        </div>
    )
}