import { asc, desc, eq, isNull } from "drizzle-orm"
import { LinkIcon } from "lucide-react"
import { DashboardPage, SectionCard, StatCard } from "@/components/dashboard-page"
import { db } from "@/db"
import { groups, links, user } from "@/db/schema"
import { requireUser } from "@/lib/session"
import { AdminLinksTable } from "./admin-links-table"

export default async function AdminLinksPage() {
	await requireUser(["admin"])

	const allLinks = await db
		.select({ slug: links.slug, url: links.url, createdAt: links.createdAt, createdBy: user.name, group: groups.name })
		.from(links)
		.innerJoin(groups, eq(groups.id, links.groupId))
		.leftJoin(user, eq(links.createdBy, user.id))
		.where(isNull(links.deletedAt))
		.orderBy(desc(links.createdAt))
	const liveGroups = await db
		.select({ id: groups.id, name: groups.name })
		.from(groups)
		.where(isNull(groups.deletedAt))
		.orderBy(asc(groups.name))

	return (
		<DashboardPage
			title="All Links"
			description="Every link, from every user"
			stats={<StatCard icon={LinkIcon} label="Total Links" value={allLinks.length} />}>
			<SectionCard icon={LinkIcon} title="All Links">
				<AdminLinksTable data={allLinks} groups={liveGroups} />
			</SectionCard>
		</DashboardPage>
	)
}
