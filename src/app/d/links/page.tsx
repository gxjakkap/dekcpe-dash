import { count, desc, eq } from "drizzle-orm"
import { LinkIcon, Plus } from "lucide-react"
import Link from "next/link"
import { DashboardPage, SectionCard } from "@/components/dashboard-page"
import { Button } from "@/components/ui/button"
import { db } from "@/db"
import { ownLiveLinks } from "@/db/links"
import { clicks, links } from "@/db/schema"
import { requireUser } from "@/lib/session"
import { LinksTable } from "./links-table"

export default async function LinksPage() {
	const session = await requireUser()

	const userLinks = await db
		.select({
			slug: links.slug,
			url: links.url,
			createdAt: links.createdAt,
			clickCount: count(clicks.id),
		})
		.from(links)
		.leftJoin(clicks, eq(links.id, clicks.linkId))
		.where(ownLiveLinks(session.user.id))
		.groupBy(links.id)
		.orderBy(desc(links.createdAt))

	return (
		<DashboardPage
			title="Your Links"
			description="Manage your links"
			action={
				<Button size="lg" className="gap-2 shrink-0" asChild>
					<Link href="/d/links/create">
						<Plus className="h-4 w-4" />
						Create New Link
					</Link>
				</Button>
			}>
			<SectionCard icon={LinkIcon} title="All Links">
				<LinksTable data={userLinks} />
			</SectionCard>
		</DashboardPage>
	)
}
