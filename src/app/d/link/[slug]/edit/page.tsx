import { notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { getOwnedLink } from "@/db/links"
import { requireUser } from "@/lib/session"
import EditLinkForm from "./edit-link-form"

type Props = { params: Promise<{ slug: string }> }

export default async function EditLinkPage({ params }: Props) {
	const { slug } = await params
	const session = await requireUser()

	const link = await getOwnedLink(slug, session.user.id)
	if (!link) notFound()

	return (
		<div className="flex flex-col w-full pt-4">
			<div className="flex flex-col w-full max-w-2xl mx-auto gap-y-8">
				<h1 className="text-3xl font-bold tracking-tight">Edit /{slug}</h1>
				<Card className="p-4">
					<EditLinkForm slug={slug} dest={link.url} />
				</Card>
			</div>
		</div>
	)
}
