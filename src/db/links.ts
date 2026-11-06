import { and, eq, isNull } from "drizzle-orm"
import { db } from "@/db"
import { links } from "@/db/schema"

export const ownLiveLinks = (userId: string) => and(eq(links.owner, userId), isNull(links.deletedAt))

export async function getOwnedLink(slug: string, userId: string) {
	const [link] = await db
		.select()
		.from(links)
		.where(and(eq(links.slug, slug), ownLiveLinks(userId)))
		.limit(1)
	return link
}
