import { count, eq } from "drizzle-orm"
import { BarChart3, Clock, CopyPlus, LinkIcon, Plus } from "lucide-react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { LinksColumn, LinksTable } from "@/components/table/links-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/db"
import { links, clicks } from "@/db/schema"
import { auth } from "@/lib/auth"
import Link from "next/link"

export default async function LinksPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session){
        redirect("/sign-in")
    }

    const usersLinks = await db
        .select({
            id: links.id,
            slug: links.slug,
            url: links.url,
            createdAt: links.createdAt,
            updatedAt: links.updatedAt,
            deletedAt: links.deletedAt,
            clickCount: count(clicks.id).as('clickCount'),
        })
        .from(links)
        .leftJoin(clicks, eq(links.id, clicks.linkId))
        .where(eq(links.owner, session.user.id))
        .groupBy(links.id)
    
    const linksData: LinksColumn[] = usersLinks.map((link) => ({
        id: link.id.toString(),
        slug: link.slug,
        url: link.url,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
        deletedAt: link.deletedAt ?? null,
        clickCount: link.clickCount,
    }))

    const totalLinks = linksData.length
    const totalClicks = linksData.reduce((sum, link) => sum + link.clickCount, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your Links</h1>
              </div>
              <p className="text-base md:text-xl text-muted-foreground">Manage your links</p>
            </div>
            <Link href={"/d/links/create"}>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Link
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
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

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Clicks</p>
                    <p className="text-2xl font-bold">{totalClicks}</p>
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
            <LinksTable data={linksData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}