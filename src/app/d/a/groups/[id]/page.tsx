import { eq, sql } from "drizzle-orm"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { db } from "@/db"
import { getMembership } from "@/db/groups"
import { groups, user } from "@/db/schema"
import { requireUser } from "@/lib/session"
import { GroupDetail } from "../../../groups/[id]/group-detail"
import { GroupAdminButtons } from "../group-admin-buttons"

export default async function AdminGroupPage({ params }: { params: Promise<{ id: string }> }) {
	const { user: me } = await requireUser(["admin"])
	const { id } = await params
	const groupId = /^\d+$/.test(id) ? Number(id) : 0
	if (!Number.isSafeInteger(groupId) || groupId < 1) notFound()

	const [group] = await db
		.select({
			name: groups.name,
			ownerId: groups.ownerId,
			owner: user.name,
			deleted: sql<boolean>`${groups.deletedAt} is not null`,
			links: sql<number>`(select count(*)::int from links l where l.group_id = ${groups.id} and l.deleted_at is not distinct from ${groups.deletedAt})`,
		})
		.from(groups)
		.leftJoin(user, eq(user.id, groups.ownerId))
		.where(eq(groups.id, groupId))
	if (!group) notFound()

	const isMember = !group.deleted && !!(await getMembership(groupId, me.id))

	return (
		<>
			<div className="container mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 pt-8 text-sm text-muted-foreground">
				<Badge variant={group.deleted ? "destructive" : "secondary"}>{group.deleted ? "Deleted" : "Active"}</Badge>
				<span>Owner: {group.owner ?? "—"}</span>
				<div className="flex gap-2 sm:ml-auto">
					{isMember && (
						<Button asChild variant="outline" size="sm">
							<Link href={`/d/groups/${groupId}`}>Open as member</Link>
						</Button>
					)}
					<GroupAdminButtons
						group={{
							id: groupId,
							name: group.name,
							owner: group.owner,
							isOwner: group.ownerId === me.id,
							deleted: group.deleted,
							links: group.links,
						}}
					/>
				</div>
			</div>
			<GroupDetail groupId={groupId} controls="none" />
		</>
	)
}
