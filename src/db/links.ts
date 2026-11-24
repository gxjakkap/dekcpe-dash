import { and, eq, inArray, isNull } from "drizzle-orm"
import { db } from "@/db"
import { memberGroupIds } from "@/db/groups"
import { links } from "@/db/schema"

/** live links in the live groups the user belongs to */
export const accessibleLiveLinks = (userId: string) =>
	and(inArray(links.groupId, memberGroupIds(userId)), isNull(links.deletedAt))

export async function getAccessibleLink(slug: string, userId: string) {
	const [link] = await db
		.select()
		.from(links)
		.where(and(eq(links.slug, slug), accessibleLiveLinks(userId)))
		.limit(1)
	return link
}
