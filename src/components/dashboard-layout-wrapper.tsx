"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "./dashboard-sidebar"

export function DashboardLayoutWrapper({ children, isAdmin, name }: { children: React.ReactNode, isAdmin: boolean, name: string }) {
  return (
    <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-screen">
            <aside className="w-64 shrink-0">
                <DashboardSidebar isAdmin={isAdmin} name={name} />
            </aside>
            <main className="flex-1 w-full relative overflow-x-auto px-6 pt-4">
                {/* <SidebarTrigger className="z-50 fixed top-4 left-4" /> */}
                {children}
            </main>
        </div>
    </SidebarProvider>
  )
}
