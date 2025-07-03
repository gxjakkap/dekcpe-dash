import EditLinkForm from "@/components/links/edit/edit-link"
import { Card } from "@/components/ui/card"
import { db } from "@/db"
import { links } from "@/db/schema"
import { auth } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"

type Props = { params: Promise<{ slug: string }> }

export default async function EditLinkPage({ params }: Props) {
    const slug = (await params).slug
    
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) redirect("/sign-in")
    
    const [linkRes] = await db.select().from(links).where(eq(links.slug, slug)).limit(1)

    if (!linkRes || linkRes.deletedAt || (linkRes.owner !== session.user.id)) {
        return notFound()
    }

    return (
        <div className="flex flex-col w-full pt-4">
            <div className="flex flex-col w-2/3 mx-auto gap-y-12">
                <h3 className="text-3xl">Edit /{slug}</h3>
                <Card className="p-4">
                    <EditLinkForm
                        slug={slug}
                    />
                </Card>
            </div>
        </div>
    )
}