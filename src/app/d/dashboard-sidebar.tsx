"use client"

import { ChevronUp, LogOut, Plus, User2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar"
import { signOut } from "@/lib/auth-client"
import { adminItems, isItemActive, items, type NavItem } from "./nav"

function NavMenuItems({ items, pathname }: { items: NavItem[]; pathname: string }) {
	return items.map((item) => (
		<SidebarMenuItem key={item.title}>
			<SidebarMenuButton asChild isActive={isItemActive(item, pathname)}>
				<Link href={item.url}>
					<item.icon />
					<span>{item.title}</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	))
}

interface DashboardSidebarProps {
	isAdmin: boolean
	name: string
}

export function DashboardSidebar({ isAdmin, name }: DashboardSidebarProps) {
	const pathname = usePathname()
	const { setOpenMobile } = useSidebar()

	// the mobile sidebar is a sheet over the page: close it once a link has navigated
	// biome-ignore lint/correctness/useExhaustiveDependencies: runs on route change by design
	useEffect(() => {
		setOpenMobile(false)
	}, [pathname, setOpenMobile])
	return (
		<Sidebar>
			<SidebarHeader className="flex items-center justify-between md:pt-10">
				<h3 className="font-display text-2xl font-medium">dekcpe.link</h3>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Hi, {name}!</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<Button className="w-full my-2" asChild>
								<Link href={"/d/links/create"}>
									<Plus /> Create New Link
								</Link>
							</Button>
							<NavMenuItems items={items} pathname={pathname} />
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				{isAdmin && (
					<SidebarGroup>
						<SidebarGroupLabel>Admin</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								<NavMenuItems items={adminItems} pathname={pathname} />
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
			</SidebarContent>
			<SidebarFooter className="mb-10">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton>
									<User2 /> {name}
									<ChevronUp className="ml-auto" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent side="top" className="w-(--radix-popper-anchor-width) z-50">
								<DropdownMenuItem className="flex space-x-2" onClick={signOut}>
									<LogOut className="text-muted-foreground w-4 h-4" />
									<span>Sign Out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	)
}
