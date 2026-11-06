import { count, eq } from "drizzle-orm"
import { SendIcon } from "lucide-react"
import { DashboardPage, SectionCard } from "@/components/dashboard-page"
import { db } from "@/db"
import { invite, inviteUsage, user } from "@/db/schema"
import { requireUser } from "@/lib/session"
import { AdminInviteTable } from "./invites-table"

export default async function InvitesPage() {
	await requireUser(["admin"])

	const invites = await db
		.select({
			id: invite.id,
			code: invite.code,
			maxUses: invite.maxUses,
			createdBy: user.name,
			creationDate: invite.creationDate,
			expirationDate: invite.expirationDate,
			currentUses: count(inviteUsage.id),
		})
		.from(invite)
		.innerJoin(user, eq(invite.createdBy, user.id))
		.leftJoin(inviteUsage, eq(inviteUsage.inviteId, invite.id))
		.groupBy(invite.id, user.name)
		.orderBy(invite.id)

	return (
		<DashboardPage title="Invites">
			<SectionCard icon={SendIcon} title="All Invites">
				<AdminInviteTable data={invites} />
			</SectionCard>
		</DashboardPage>
	)
}
