import { count, eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { DashboardPage } from "@/components/dashboard-page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/db"
import { getOwnedLink } from "@/db/links"
import { clicks } from "@/db/schema"
import { shortLinkUrl } from "@/lib/links"
import { requireUser } from "@/lib/session"
import { formatDate, stripProtocol } from "@/lib/utils"
import LinkActions from "./link-actions"
import LinkInfo from "./link-info"

type Props = { params: Promise<{ slug: string }> }

export default async function LinkPage({ params }: Props) {
	const { slug } = await params
	const session = await requireUser()

	const link = await getOwnedLink(slug, session.user.id)
	if (!link) notFound()

	const [stats] = await db.select({ clickCount: count() }).from(clicks).where(eq(clicks.linkId, link.id))
	const shortlink = shortLinkUrl(link.slug)

	return (
		<DashboardPage
			className="max-w-6xl"
			title={<span className="font-mono font-semibold text-brand break-all">{stripProtocol(shortlink)}</span>}
			description={<span className="block truncate">→ {link.url}</span>}>
			<div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
				<div className="xl:col-span-3">
					<LinkInfo
						shortlink={shortlink}
						dest={link.url}
						dateCreated={formatDate(link.createdAt)}
						dateModified={formatDate(link.updatedAt)}
					/>
				</div>

				<div className="xl:col-span-1">
					<LinkActions slug={link.slug} dest={link.url} />
					<Card className="mt-6">
						<CardHeader>
							<CardTitle className="text-lg">Quick Stats</CardTitle>
						</CardHeader>
						<CardContent className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">Total Clicks</span>
							<span className="font-semibold">{stats.clickCount}</span>
						</CardContent>
					</Card>
				</div>
			</div>
		</DashboardPage>
	)
}
