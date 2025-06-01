import { eq } from "drizzle-orm"
import { LinkIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/db"
import { links, user } from "@/db/schema"
import { AdminLinksColumn, AdminLinksTable } from "@/components/table/admin-links-table"

export default async function AdminLinksPage() {
    const usersLinks = await db
        .select({
            id: links.id,
            slug: links.slug,
            url: links.url,
            createdAt: links.createdAt,
            updatedAt: links.updatedAt,
            deletedAt: links.deletedAt,
            owner: user.name,
        })
        .from(links)
        .leftJoin(user, eq(links.owner, user.id))
    
    const linksData: AdminLinksColumn[] = usersLinks.map((link) => ({
        id: link.id.toString(),
        slug: link.slug,
        url: link.url,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
        deletedAt: link.deletedAt ?? null,
        owner: link.owner ?? "Unknown",
    }))

    const totalLinks = linksData.length

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">All Links</h1>
              </div>
              <p className="text-base md:text-xl text-muted-foreground">Manage all user's links</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <LinkIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Links</p>
                    <p className="text-2xl font-bold">{totalLinks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              All Links
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <AdminLinksTable data={linksData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}