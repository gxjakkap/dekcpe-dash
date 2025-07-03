import { auth } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { db } from "@/db"
import { clicks, links } from "@/db/schema"
import { count, eq } from "drizzle-orm"
import LinkInfo from "@/components/links/link-info"
import LinkActions from "@/components/links/link-actions"
import LinkQuickStats from "@/components/links/link-quick-stats"

type Props = { params: Promise<{ slug: string }> }

export default async function LinkPage({ params }: Props) {
    const slug = (await params).slug

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) redirect("/sign-in")
    
    const [linkRes] = await db.select().from(links).where(eq(links.slug, slug)).limit(1)

    if (!linkRes || linkRes.deletedAt || (linkRes.owner !== session.user.id)) {
        return notFound()
    }

    const [stats] = await db
        .select({
            clickCount: count(clicks.id).as("clickCount"),
        })
        .from(links)
        .leftJoin(clicks, eq(links.id, clicks.linkId))
        .where(eq(links.id, linkRes.id))

    return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight">Link Management</h1>
          </div>
          <p className="text-xl text-muted-foreground">/{linkRes.slug}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <LinkInfo
              slug={linkRes.slug}
              dest={linkRes.url}
              dateCreated={linkRes.createdAt.toLocaleDateString()}
              dateModified={linkRes.updatedAt.toLocaleDateString()}
              className="h-fit"
            />
          </div>

          <div className="xl:col-span-1">
            <LinkActions slug={linkRes.slug} dest={linkRes.url} />
            <LinkQuickStats
                totalClicks={stats.clickCount}
            />
          </div>
        </div>
      </div>
    </div>
  )
}