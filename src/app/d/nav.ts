import { Home, LinkIcon, Send, Unlink, Users, UsersRound } from "lucide-react"

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
	{
		title: "Groups",
		url: "/d/groups",
		icon: UsersRound,
		match: "/d/groups",
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
	{
		title: "Groups",
		url: "/d/a/groups",
		icon: UsersRound,
		match: "/d/a/groups",
	},
]

export const isItemActive = (item: NavItem, pathname: string) =>
	item.match ? pathname.startsWith(item.match) : pathname === item.url
