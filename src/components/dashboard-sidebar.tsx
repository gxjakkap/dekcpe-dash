"use client"

import { ChevronUp, Home, LinkIcon, LogOut, Plus, Send, Unlink, User2, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

interface NavItem {
	title: string
	url: string
	icon: typeof Home
	// active for every path under this prefix, not just `url` itself
	match?: string
}

export const items: NavItem[] = [
	{
		title: "Home",
		url: "/d",
		icon: Home,
	},
	{
		title: "Links",
		url: "/d/links",
		icon: LinkIcon,
		match: "/d/link",
	},
]

export const adminItems: NavItem[] = [
	{
		title: "Users",
		url: "/d/a/users",
		icon: Users,
	},
	{
		title: "Invites",
		url: "/d/a/invites",
		icon: Send,
	},
	{
		title: "All Links",
		url: "/d/a/all",
		icon: Unlink,
	},
]

export const isItemActive = (item: NavItem, pathname: string) =>
	item.match ? pathname.startsWith(item.match) : pathname === item.url

interface DashboardSidebarProps {
	isAdmin: boolean
	name: string
}

export function DashboardSidebar({ isAdmin, name }: DashboardSidebarProps) {
	const pathname = usePathname()
	return (
		<Sidebar className="pt-8">
			<SidebarHeader className="flex items-center justify-between">
				<h3 className="text-2xl font-bold">dekcpe.link 🔗</h3>
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
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={isItemActive(item, pathname)}>
										<Link href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				{isAdmin && (
					<SidebarGroup>
						<SidebarGroupLabel>Admin</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{adminItems.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild isActive={isItemActive(item, pathname)}>
											<Link href={item.url}>
												<item.icon />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
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
								<DropdownMenuItem
									className="flex space-x-2"
									onClick={() => {
										authClient.signOut({
											fetchOptions: {
												onSuccess: () => {
													location.href = "/sign-in"
												},
											},
										})
									}}>
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
