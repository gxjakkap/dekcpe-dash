import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { db } from "@/db"
import { user } from "@/db/schema"
import { auth } from "@/lib/auth"
import { AdminUserTable, UserColumn } from "@/components/table/admin-users-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PersonIcon } from "@radix-ui/react-icons"

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

    return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto md:px-4 py-8 max-w-7xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Users</h1>
                  </div>
                </div>
              </div>
            </div>
    
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PersonIcon className="h-5 w-5" />
                  All Users
                </CardTitle>
              </CardHeader>
              <CardContent className="md:px-6">
                <AdminUserTable
                    data={usersData}
                />
              </CardContent>
            </Card>
          </div>
        </div>
    )
}