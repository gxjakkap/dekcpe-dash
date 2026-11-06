"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SIDEBAR_STATUS } from "@/lib/const"
import { adminItems, DashboardSidebar, isItemActive, items } from "./dashboard-sidebar"
import { ThemeToggle } from "./theme-toggle"

export function DashboardLayoutWrapper({
	children,
	isAdmin,
	name,
	openState,
}: {
	children: React.ReactNode
	isAdmin: boolean
	name: string
	openState: SIDEBAR_STATUS
}) {
	const [sidebarOpen, setSidebarOpen] = useState(openState === SIDEBAR_STATUS.OPEN)
	const pathname = usePathname()
	const title = [...items, ...adminItems].find((item) => isItemActive(item, pathname))?.title

	// no saved preference yet: open on desktop widths only (needs window, so after mount)
	useEffect(() => {
		if (openState === SIDEBAR_STATUS.NOT_SET) {
			setSidebarOpen(window.innerWidth >= 1024)
		}
	}, [openState])

	return (
		<SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
			<DashboardSidebar isAdmin={isAdmin} name={name} />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="z-50" />
					{title && <span className="font-medium">{title}</span>}
					<ThemeToggle className="ml-auto" />
				</header>
				<main className="flex-1 w-full relative overflow-x-auto px-6 lg:px-12 pt-4 pb-12">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	)
}
