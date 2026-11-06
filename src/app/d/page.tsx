import { flag } from "country-emoji"
import { count, countDistinct, desc, eq, sql } from "drizzle-orm"
import { BarChart3, ChartLine, LinkIcon } from "lucide-react"
import { DashboardPage, SectionCard, StatCard } from "@/components/dashboard-page"
import { db } from "@/db"
import { ownLiveLinks } from "@/db/links"
import { clicks, links } from "@/db/schema"
import { requireUser } from "@/lib/session"
import { deviceFromUserAgent } from "./device"
import { QuickAnalyticsTable } from "./quick-analytics-table"

const country = sql<string>`COALESCE(NULLIF(${clicks.geolocation}->>'Country', ''), 'Unknown')`

export default async function DashboardHome() {
	const session = await requireUser()
	const mine = ownLiveLinks(session.user.id)

	const [totals] = await db
		.select({ links: countDistinct(links.id), clicks: count(clicks.id) })
		.from(links)
		.leftJoin(clicks, eq(links.id, clicks.linkId))
		.where(mine)

	const topCountries = await db
		.select({ country, count: count() })
		.from(clicks)
		.innerJoin(links, eq(clicks.linkId, links.id))
		.where(mine)
		.groupBy(country)
		.orderBy(desc(count()))
		.limit(10)

	const userAgents = await db
		.select({ userAgent: clicks.userAgent })
		.from(clicks)
		.innerJoin(links, eq(clicks.linkId, links.id))
		.where(mine)

	const deviceCounts = new Map<string, number>()
	for (const { userAgent } of userAgents) {
		const device = deviceFromUserAgent(userAgent)
		deviceCounts.set(device, (deviceCounts.get(device) ?? 0) + 1)
	}
	const topDevices = [...deviceCounts]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)
		.map(([name, count]) => ({ name, count }))

	return (
		<DashboardPage
			title="Overview"
			description="How your links are doing"
			stats={
				<>
					<StatCard icon={LinkIcon} label="Total Links" value={totals.links} />
					<StatCard icon={BarChart3} label="Total Clicks" value={totals.clicks} />
				</>
			}>
			<SectionCard icon={ChartLine} title="Quick Analytics">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 md:gap-x-4 w-full">
					<QuickAnalyticsTable
						label="Country"
						rows={topCountries.map((x) => ({ name: `${flag(x.country) ?? ""} ${x.country}`, count: x.count }))}
					/>
					<QuickAnalyticsTable label="Device" rows={topDevices} />
				</div>
			</SectionCard>
		</DashboardPage>
	)
}
