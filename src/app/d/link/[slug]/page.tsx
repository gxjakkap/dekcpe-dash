import { count, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import LinkActions from "@/components/links/link-actions"
import LinkInfo from "@/components/links/link-info"
import LinkQuickStats from "@/components/links/link-quick-stats"
import { db } from "@/db"
import { clicks, links } from "@/db/schema"
import { auth } from "@/lib/auth"
import { formatDate, stripProtocol } from "@/lib/utils"

type Props = { params: Promise<{ slug: string }> }

export default async function LinkPage({ params }: Props) {
	const slug = (await params).slug

	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) redirect("/sign-in")

	const [linkRes] = await db.select().from(links).where(eq(links.slug, slug)).limit(1)

	if (!linkRes || linkRes.deletedAt || linkRes.owner !== session.user.id) {
		return notFound()
	}

	const [stats] = await db
		.select({
			clickCount: count(clicks.id).as("clickCount"),
		})
		.from(links)
		.leftJoin(clicks, eq(links.id, clicks.linkId))
		.where(eq(links.id, linkRes.id))

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				<div className="mb-8 min-w-0">
					<h1 className="font-mono text-3xl md:text-4xl font-semibold tracking-tight text-brand break-all max-w-none">
						{stripProtocol(
							new URL(linkRes.slug, process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL || "https://dekcpe.link/").toString()
						)}
					</h1>
					<p className="mt-2 text-base md:text-lg text-muted-foreground truncate">→ {linkRes.url}</p>
				</div>

				<div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
					<div className="xl:col-span-3">
						<LinkInfo
							slug={linkRes.slug}
							dest={linkRes.url}
							dateCreated={formatDate(linkRes.createdAt)}
							dateModified={formatDate(linkRes.updatedAt)}
							className="h-fit"
						/>
					</div>

					<div className="xl:col-span-1">
						<LinkActions slug={linkRes.slug} dest={linkRes.url} />
						<LinkQuickStats totalClicks={stats.clickCount} />
					</div>
				</div>
			</div>
		</div>
	)
}
