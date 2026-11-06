import { Users } from "lucide-react"
import { DashboardPage, SectionCard } from "@/components/dashboard-page"
import { db } from "@/db"
import { user } from "@/db/schema"
import { requireUser } from "@/lib/session"
import { AdminUserTable } from "./users-table"

export default async function UsersPage() {
	await requireUser(["admin"])

	const users = await db
		.select({ id: user.id, name: user.name, email: user.email, role: user.role, banned: user.banned })
		.from(user)
		.orderBy(user.role)

	return (
		<DashboardPage title="Users">
			<SectionCard icon={Users} title="All Users">
				<AdminUserTable data={users} />
			</SectionCard>
		</DashboardPage>
	)
}
