import { Home, LinkIcon, Send, Unlink, Users } from "lucide-react"

export interface NavItem {
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
