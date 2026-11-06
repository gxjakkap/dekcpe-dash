import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import EditLinkForm from "@/components/links/edit/edit-link"
import { Card } from "@/components/ui/card"
import { db } from "@/db"
import { links } from "@/db/schema"
import { auth } from "@/lib/auth"

type Props = { params: Promise<{ slug: string }> }

export default async function EditLinkPage({ params }: Props) {
	const slug = (await params).slug

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) redirect("/sign-in")

	const [linkRes] = await db.select().from(links).where(eq(links.slug, slug)).limit(1)

	if (!linkRes || linkRes.deletedAt || linkRes.owner !== session.user.id) {
		return notFound()
	}

	return (
		<div className="flex flex-col w-full pt-4">
			<div className="flex flex-col w-full max-w-2xl mx-auto gap-y-8">
				<h1 className="text-3xl font-bold tracking-tight">Edit /{slug}</h1>
				<Card className="p-4">
					<EditLinkForm slug={slug} dest={linkRes.url} />
				</Card>
			</div>
		</div>
	)
}
