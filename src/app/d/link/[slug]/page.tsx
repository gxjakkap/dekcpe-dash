import { code } from "country-emoji"
import { count, eq } from "drizzle-orm"
import iso from "i18n-iso-countries"
import en from "i18n-iso-countries/langs/en.json"
import { MapIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { DashboardPage, SectionCard } from "@/components/dashboard-page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/db"
import { clickCity, clickCountry, clickRegion } from "@/db/clicks"
import { getOwnedLink } from "@/db/links"
import { clicks } from "@/db/schema"
import { shortLinkUrl } from "@/lib/links"
import { requireUser } from "@/lib/session"
import { formatDate, stripProtocol } from "@/lib/utils"
import { topDevices } from "../../device"
import { QuickAnalyticsTable } from "../../quick-analytics-table"
import { ClickMap } from "./click-map"
import LinkActions from "./link-actions"
import LinkInfo from "./link-info"

iso.registerLocale(en)

// ip-api country names; country-emoji knows most, i18n-iso-countries catches "Türkiye", neither knows "Laos"
const alpha2 = (name: string) => code(name) ?? iso.getAlpha2Code(name, "en") ?? (name === "Laos" ? "LA" : undefined)

type Props = { params: Promise<{ slug: string }> }

export default async function LinkPage({ params }: Props) {
	const { slug } = await params
	const session = await requireUser()

	const link = await getOwnedLink(slug, session.user.id)
	if (!link) notFound()

	const [stats] = await db.select({ clickCount: count() }).from(clicks).where(eq(clicks.linkId, link.id))
	const shortlink = shortLinkUrl(link.slug)
	const devices = await topDevices(eq(clicks.linkId, link.id))

	const locations = await db
		.select({ country: clickCountry, region: clickRegion, city: clickCity, count: count() })
		.from(clicks)
		.where(eq(clicks.linkId, link.id))
		.groupBy(clickCountry, clickRegion, clickCity)

	return (
		<DashboardPage
			className="max-w-6xl"
			title={
				// wraps after the "/" so the slug stays whole; break-words only splits a segment wider than the screen
				<span className="font-mono font-semibold text-brand break-words text-2xl md:text-4xl">
					{stripProtocol(shortLinkUrl())}
					<wbr />
					{link.slug}
				</span>
			}
			description={<span className="block truncate">→ {link.url}</span>}>
			<div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
				<div className="xl:col-span-3 space-y-6">
					<LinkInfo
						shortlink={shortlink}
						dest={link.url}
						dateCreated={formatDate(link.createdAt)}
						dateModified={formatDate(link.updatedAt)}
					/>
					<SectionCard icon={MapIcon} title="Clicks by Location">
						<ClickMap
							locations={locations.map((x) => {
								const a2 = alpha2(x.country)
								return { ...x, numeric: a2 && iso.alpha2ToNumeric(a2), iso3: a2 && iso.alpha2ToAlpha3(a2) }
							})}
						/>
					</SectionCard>
				</div>

				<div className="xl:col-span-1">
					<LinkActions slug={link.slug} dest={link.url} />
					<Card className="mt-6">
						<CardHeader>
							<CardTitle className="text-lg">Stats</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* px-3 matches the table cells below so label and count line up with its columns */}
							<div className="flex justify-between items-center px-3">
								<span className="text-sm text-muted-foreground">Total Clicks</span>
								<span className="font-semibold tabular-nums">{stats.clickCount}</span>
							</div>
							<QuickAnalyticsTable label="Device" rows={devices} />
						</CardContent>
					</Card>
				</div>
			</div>
		</DashboardPage>
	)
}
