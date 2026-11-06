import { desc, eq } from "drizzle-orm"
import { LinkIcon } from "lucide-react"
import { DashboardPage, SectionCard, StatCard } from "@/components/dashboard-page"
import { db } from "@/db"
import { links, user } from "@/db/schema"
import { requireUser } from "@/lib/session"
import { AdminLinksTable } from "./admin-links-table"

export default async function AdminLinksPage() {
	await requireUser(["admin"])

	const allLinks = await db
		.select({ slug: links.slug, url: links.url, createdAt: links.createdAt, owner: user.name })
		.from(links)
		.innerJoin(user, eq(links.owner, user.id))
		.orderBy(desc(links.createdAt))

	return (
		<DashboardPage
			title="All Links"
			description="Every link, from every user"
			stats={<StatCard icon={LinkIcon} label="Total Links" value={allLinks.length} />}>
			<SectionCard icon={LinkIcon} title="All Links">
				<AdminLinksTable data={allLinks} />
			</SectionCard>
		</DashboardPage>
	)
}
