import { and, count, desc, eq, isNull } from "drizzle-orm"
import { LinkIcon, Plus } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { type LinksColumn, LinksTable } from "@/components/table/links-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/db"
import { clicks, links } from "@/db/schema"
import { auth } from "@/lib/auth"

export default async function LinksPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		redirect("/sign-in")
	}

	const usersLinks = await db
		.select({
			id: links.id,
			slug: links.slug,
			url: links.url,
			createdAt: links.createdAt,
			updatedAt: links.updatedAt,
			deletedAt: links.deletedAt,
			clickCount: count(clicks.id).as("clickCount"),
		})
		.from(links)
		.leftJoin(clicks, eq(links.id, clicks.linkId))
		.where(and(eq(links.owner, session.user.id), isNull(links.deletedAt)))
		.groupBy(links.id)
		.orderBy(desc(links.createdAt))

	const linksData: LinksColumn[] = usersLinks.map((link) => ({
		id: link.id.toString(),
		slug: link.slug,
		url: link.url,
		createdAt: link.createdAt,
		updatedAt: link.updatedAt,
		deletedAt: link.deletedAt ?? null,
		clickCount: link.clickCount,
	}))

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="mb-8">
					<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<div className="flex items-center gap-3 mb-2">
								<h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your Links</h1>
							</div>
							<p className="text-base md:text-xl text-muted-foreground">Manage your links</p>
						</div>
						<Button size="lg" className="gap-2 shrink-0" asChild>
							<Link href={"/d/links/create"}>
								<Plus className="h-4 w-4" />
								Create New Link
							</Link>
						</Button>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<LinkIcon className="h-5 w-5" />
							All Links
						</CardTitle>
					</CardHeader>
					<CardContent className="px-6">
						<LinksTable data={linksData} />
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
