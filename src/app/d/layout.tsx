import { cookies } from "next/headers"
import { SIDEBAR_COOKIE_NAME } from "@/lib/const"
import { accessOf, requireUser } from "@/lib/session"
import { DashboardLayoutWrapper } from "./dashboard-layout-wrapper"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const session = await requireUser()
	const sidebarCookie = (await cookies()).get(SIDEBAR_COOKIE_NAME)?.value

	return (
		<DashboardLayoutWrapper
			isAdmin={accessOf(session.user) === "admin"}
			name={session.user.name}
			defaultOpen={sidebarCookie === undefined ? undefined : sidebarCookie === "true"}>
			{children}
		</DashboardLayoutWrapper>
	)
}
