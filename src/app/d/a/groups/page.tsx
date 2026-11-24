import { desc, eq, sql } from "drizzle-orm"
import { UsersRoundIcon } from "lucide-react"
import { DashboardPage, SectionCard } from "@/components/dashboard-page"
import { db } from "@/db"
import { groups, user } from "@/db/schema"
import { requireUser } from "@/lib/session"
import { AdminGroupsTable } from "./admin-groups-table"

export default async function AdminGroupsPage() {
	const { user: me } = await requireUser(["admin"])

	const rows = await db
		.select({
			id: groups.id,
			name: groups.name,
			ownerId: groups.ownerId,
			owner: user.name,
			deleted: sql<boolean>`${groups.deletedAt} is not null`,
			members: sql<number>`(select count(*)::int from group_members gm where gm.group_id = ${groups.id})`,
			// live links, or for a deleted group the links deleted with it
			links: sql<number>`(select count(*)::int from links l where l.group_id = ${groups.id} and l.deleted_at is not distinct from ${groups.deletedAt})`,
		})
		.from(groups)
		.leftJoin(user, eq(user.id, groups.ownerId))
		.orderBy(sql`${groups.deletedAt} is not null`, desc(groups.createdAt), groups.id)

	const data = rows.map(({ ownerId, ...r }) => ({ ...r, isOwner: ownerId === me.id }))

	return (
		<DashboardPage title="Groups" description="Every group, including deleted ones">
			<SectionCard icon={UsersRoundIcon} title="All Groups">
				<AdminGroupsTable data={data} />
			</SectionCard>
		</DashboardPage>
	)
}
