import { and, count, countDistinct, eq, isNull, sql } from "drizzle-orm"
import { BarChart3, ChartLine, LinkIcon } from "lucide-react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { QuickAnalyticsTopCountriesTable } from "@/components/table/quick-analytics-top-countries"
import { QuickAnalyticsTopDevicesTable } from "@/components/table/quick-analytics-top-devices"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/db"
import { clicks, links } from "@/db/schema"
import { auth } from "@/lib/auth"
import { getDeviceFromUA } from "@/lib/utils"

export default async function DashboardHome() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		redirect("/sign-in")
	}

	const [result] = await db
		.select({
			linksCount: countDistinct(links.id).as("linksCount"),
			clickCount: count(clicks.id).as("clickCount"),
		})
		.from(links)
		.leftJoin(clicks, eq(links.id, clicks.linkId))
		.where(and(eq(links.owner, session.user.id), isNull(links.deletedAt)))

	const { linksCount: totalLinks, clickCount: totalClicks } = result

	const topCountries = await db
		.select({
			country: sql<string>`COALESCE(NULLIF(clicks.geolocation->>'Country', ''), 'Unknown')`,
			count: sql<number>`COUNT(*)`,
		})
		.from(clicks)
		.innerJoin(links, sql`clicks.link_id = links.id`)
		.where(sql`links.owner = ${session.user.id} AND links.deleted_at IS NULL`)
		.groupBy(sql`COALESCE(NULLIF(clicks.geolocation->>'Country', ''), 'Unknown')`)
		.orderBy(sql`COUNT(*) DESC`)
		.limit(10)

	const rawUserAgents = await db
		.select({
			userAgent: clicks.userAgent,
		})
		.from(clicks)
		.innerJoin(links, eq(clicks.linkId, links.id))
		.where(and(eq(links.owner, session.user.id), isNull(links.deletedAt)))

	const deviceMap = new Map<string, number>()

	for (const row of rawUserAgents) {
		const { dev, isBot } = getDeviceFromUA(row.userAgent)

		// bots stay in as their own row so this table adds up to Total Clicks
		const key = isBot ? "Bot" : dev
		deviceMap.set(key, (deviceMap.get(key) ?? 0) + 1)
	}

	const topDevices = Array.from(deviceMap.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)
		.map(([device, count]) => ({ device, count }))

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="mb-8">
					<div className="flex items-center justify-between mb-6">
						<div>
							<div className="flex items-center gap-3 mb-2">
								<h1 className="text-3xl md:text-4xl font-bold tracking-tight">Overview</h1>
							</div>
							<p className="text-base md:text-xl text-muted-foreground">How your links are doing</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-muted rounded-lg">
										<LinkIcon className="h-4 w-4 text-muted-foreground" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Total Links</p>
										<p className="text-2xl font-bold">{totalLinks}</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-muted rounded-lg">
										<BarChart3 className="h-4 w-4 text-muted-foreground" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Total Clicks</p>
										<p className="text-2xl font-bold">{totalClicks}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<ChartLine className="h-5 w-5" />
							Quick Analytics
						</CardTitle>
					</CardHeader>
					<CardContent className="px-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 md:gap-x-4 w-full">
							<QuickAnalyticsTopCountriesTable data={topCountries} />
							<QuickAnalyticsTopDevicesTable data={topDevices} />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
