import { count, eq } from "drizzle-orm"
import { CopyPlus, Plus } from "lucide-react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { LinksColumn, LinksTable } from "@/components/table/links-table"
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

    const linksData: LinksColumn[] = usersLinks.map(link => ({
        id: link.id,
        slug: link.slug,
        url: link.url,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
        deletedAt: link.deletedAt ?? null,
        clickCount: link.clickCount,
    }))

    console.log(linksData)

    return (
        <div className="flex flex-col min-h-screen w-full pt-4 gap-y-4">
            <h3 className="text-3xl">Your links</h3>
            <div className="flex justify-end gap-x-3 w-full">
                <Link
                    href={'/d/links/create'}
                >
                    <Button>
                        <Plus />
                        Create new link
                    </Button>
                </Link>
                {/* <Link
                    href={'/d/links/create-multiple'}
                >
                    <Button
                        variant="secondary"
                    >
                        <CopyPlus />
                        Create multiple links
                    </Button>
                </Link> */}
            </div>
            <LinksTable
                data={linksData}
            />
        </div>
    )
}