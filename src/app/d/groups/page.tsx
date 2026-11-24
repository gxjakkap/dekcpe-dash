import { and, count, eq, inArray, isNull } from "drizzle-orm"
import { UsersRoundIcon } from "lucide-react"
import { DashboardPage, SectionCard } from "@/components/dashboard-page"
import { db } from "@/db"
import { groupMembers, groups, links, user } from "@/db/schema"
import { requireUser } from "@/lib/session"
import { GroupsTable } from "./groups-table"

export default async function GroupsPage() {
	const { user: me } = await requireUser()

	const rows = await db
		.select({ id: groups.id, name: groups.name, ownerId: groups.ownerId, owner: user.name })
		.from(groups)
		.leftJoin(user, eq(user.id, groups.ownerId))
		.innerJoin(groupMembers, and(eq(groupMembers.groupId, groups.id), eq(groupMembers.userId, me.id)))
		.where(isNull(groups.deletedAt))
		.orderBy(groupMembers.joinedAt, groups.id)

	const ids = rows.map((r) => r.id)
	const [memberCounts, linkCounts] = ids.length
		? await Promise.all([
				db
					.select({ id: groupMembers.groupId, n: count() })
					.from(groupMembers)
					.where(inArray(groupMembers.groupId, ids))
					.groupBy(groupMembers.groupId),
				db
					.select({ id: links.groupId, n: count() })
					.from(links)
					.where(and(inArray(links.groupId, ids), isNull(links.deletedAt)))
					.groupBy(links.groupId),
			])
		: [[], []]
	const members = new Map(memberCounts.map((c) => [c.id, c.n]))
	const linkTotals = new Map(linkCounts.map((c) => [c.id, c.n]))

	const data = rows.map((r) => ({
		id: r.id,
		name: r.name,
		owner: r.owner,
		isOwner: r.ownerId === me.id,
		members: members.get(r.id) ?? 0,
		links: linkTotals.get(r.id) ?? 0,
	}))

	return (
		<DashboardPage title="Groups" description="Groups you belong to">
			<SectionCard icon={UsersRoundIcon} title="My Groups">
				<GroupsTable data={data} />
			</SectionCard>
		</DashboardPage>
	)
}
