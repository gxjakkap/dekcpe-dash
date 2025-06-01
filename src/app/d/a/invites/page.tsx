import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { db } from "@/db"
import { invite, inviteUsage, user } from "@/db/schema"
import { auth } from "@/lib/auth"
import { AdminInviteTable, InviteColumn } from "@/components/table/admin-invites-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SendIcon } from "lucide-react"

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
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Invites</h1>
                            </div>
                        </div>
                    </div>
                </div>
    
                <Card>
                    <CardHeader className="pt-4">
                        <CardTitle className="text-lg flex items-center gap-2 ml-4">
                            <SendIcon className="h-5 w-5" />
                            All Invites
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6">
                        <AdminInviteTable
                            data={invitesData}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}