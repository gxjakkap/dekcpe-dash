import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { db } from "@/db"
import { invite, inviteUsage, user } from "@/db/schema"
import { auth } from "@/lib/auth"
import { AdminInviteTable, InviteColumn } from "@/components/table/admin-invites-table"

export default async function CreateLinkPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session){
        redirect("/sign-in")
    }

    const invites = await db.select().from(invite)
    const inviteUsages = await db.select().from(inviteUsage)
    const users = await db.select().from(user)
    const userMap = new Map(users.map(u => [u.id, u]))

    const invitesData: InviteColumn[] = invites.map(x => {
        return {
            id: x.id,
            code: x.code,
            maxUses: x.maxUses,
            createdBy: userMap.get(x.createdBy)?.name ?? "Unknown",
            creationDate: x.creationDate,
            expirationDate: x.expirationDate,
            currentUses: inviteUsages.filter(u => u.inviteId === x.id).length,
            usedBy: inviteUsages.filter(u => u.inviteId === x.id).map(u => userMap.get(u.userId)?.name).filter((name): name is string => !!name)
        }
    })

    console.log(invitesData)

    return (
        <div className="flex flex-col min-h-screen w-full pt-4">
            <h3 className="text-3xl">Invites</h3>
            <AdminInviteTable
                data={invitesData}
            />
        </div>
    )
}