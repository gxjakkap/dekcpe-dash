import { asc, count, desc, eq, sql } from "drizzle-orm"
import { LinkIcon, UsersRoundIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { DashboardPage, SectionCard } from "@/components/dashboard-page"
import { Badge } from "@/components/ui/badge"
import { db } from "@/db"
import { clicks, groupMembers, groups, links, user } from "@/db/schema"
import { GroupLinksTable } from "./group-links-table"
import { GroupSettings } from "./group-settings"
import { MembersTable } from "./members-table"

export type GroupControls = "owner" | "member" | "none"

/** a group's members and links; `controls` decides what the viewer may do (the caller has already authorised the view) */
export async function GroupDetail({ groupId, controls }: { groupId: number; controls: GroupControls }) {
	const [group] = await db.select().from(groups).where(eq(groups.id, groupId))
	if (!group) notFound()

	const members = await db
		.select({
			userId: user.id,
			name: user.name,
			email: user.email,
			joinedAt: groupMembers.joinedAt,
			isOwner: sql<boolean>`${groupMembers.userId} = ${groups.ownerId}`,
		})
		.from(groupMembers)
		.innerJoin(groups, eq(groups.id, groupMembers.groupId))
		.innerJoin(user, eq(user.id, groupMembers.userId))
		.where(eq(groupMembers.groupId, groupId))
		.orderBy(desc(sql`${groupMembers.userId} = ${groups.ownerId}`), asc(groupMembers.joinedAt))

	// a deleted group shows the links that were deleted along with it
	const groupLinks = await db
		.select({
			slug: links.slug,
			url: links.url,
			createdAt: links.createdAt,
			clickCount: count(clicks.id),
			createdBy: user.name,
		})
		.from(links)
		.leftJoin(user, eq(user.id, links.createdBy))
		.leftJoin(clicks, eq(clicks.linkId, links.id))
		.where(sql`${links.groupId} = ${groupId} and ${links.deletedAt} is not distinct from ${group.deletedAt}`)
		.groupBy(links.id, user.name)
		.orderBy(desc(links.createdAt))

	return (
		<DashboardPage
			title={
				<>
					{group.name}
					{group.deletedAt && (
						<Badge variant="secondary" className="ml-3 align-middle">
							Deleted
						</Badge>
					)}
				</>
			}
			description={`${members.length} ${members.length === 1 ? "member" : "members"}`}>
			<div className="flex flex-col gap-6">
				<SectionCard icon={UsersRoundIcon} title="Members">
					<MembersTable data={members} groupId={groupId} controls={controls} />
				</SectionCard>
				<SectionCard icon={LinkIcon} title="Links">
					<GroupLinksTable data={groupLinks} linkable={controls !== "none"} />
				</SectionCard>
				{controls !== "none" && <GroupSettings groupId={groupId} name={group.name} controls={controls} />}
			</div>
		</DashboardPage>
	)
}
