import { and, count, desc, eq } from "drizzle-orm"
import { LinkIcon, Plus } from "lucide-react"
import Link from "next/link"
import { DashboardPage, SectionCard } from "@/components/dashboard-page"
import { Button } from "@/components/ui/button"
import { db } from "@/db"
import { userGroups } from "@/db/groups"
import { accessibleLiveLinks } from "@/db/links"
import { clicks, groups, links, user } from "@/db/schema"
import { requireUser } from "@/lib/session"
import { LinksTable } from "./links-table"

export default async function LinksPage({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
	const session = await requireUser()
	const myGroups = await userGroups(session.user.id)
	const { group } = await searchParams
	// an id that isn't one of the user's groups shows everything
	const groupId = myGroups.find((g) => String(g.id) === group)?.id

	const userLinks = await db
		.select({
			slug: links.slug,
			url: links.url,
			createdAt: links.createdAt,
			clickCount: count(clicks.id),
			group: groups.name,
			createdBy: user.name,
		})
		.from(links)
		.innerJoin(groups, eq(groups.id, links.groupId))
		.leftJoin(user, eq(user.id, links.createdBy))
		.leftJoin(clicks, eq(links.id, clicks.linkId))
		.where(and(accessibleLiveLinks(session.user.id), groupId ? eq(links.groupId, groupId) : undefined))
		.groupBy(links.id, groups.name, user.name)
		.orderBy(desc(links.createdAt))

	return (
		<DashboardPage
			title="Links"
			description="Links from all your groups"
			action={
				<Button size="lg" className="gap-2 shrink-0" asChild>
					<Link href="/d/links/create">
						<Plus className="h-4 w-4" />
						Create New Link
					</Link>
				</Button>
			}>
			<SectionCard icon={LinkIcon} title="All Links">
				<LinksTable data={userLinks} groups={myGroups} />
			</SectionCard>
		</DashboardPage>
	)
}
