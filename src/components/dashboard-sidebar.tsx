import { ChartNoAxesCombined, ChevronUp, Home, LinkIcon, LogOut, Plus, Send, Unlink, User2, Users } from "lucide-react"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"

const items = [
  {
    title: "Home",
    url: "/d",
    icon: Home,
  },
  {
    title: "Links",
    url: "/d/links",
    icon: LinkIcon,
  }
]

const adminItems = [
    {
        title: "Manage Users",
        url: "/d/a/users",
        icon: Users
    },
    {
        title: "Manage Invite",
        url: "/d/a/invites",
        icon: Send
    },
    {
        title: "Manage All Links",
        url: "/d/a/all ",
        icon: Unlink
    },
    {
        title: "View All Analytics",
        url: "/d/a/clicks",
        icon: ChartNoAxesCombined
    }
]

interface DashboardSidebarProps {
    isAdmin: boolean,
    name: string
}

export function DashboardSidebar({ isAdmin, name }: DashboardSidebarProps) {
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
                    <Link
                        href={"/d/links/create"}
                    >
                        <div className="flex w-full mx-auto my-2">
                            <Button className="w-full"><Plus />{" "}Create New Link</Button>
                        </div>
                    </Link>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <a href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </a>
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
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
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
                    <DropdownMenuContent
                        side="top"
                        className="w-[--radix-popper-anchor-width] z-50"
                    >
                        <DropdownMenuItem
                            className="flex spaxe-x-2"
                            onClick={() => {
                                authClient.signOut({
                                    fetchOptions: {
                                        onSuccess: () => {
                                            location.href = "/sign-in"
                                        }
                                    }
                                })
                            }}
                        >
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
