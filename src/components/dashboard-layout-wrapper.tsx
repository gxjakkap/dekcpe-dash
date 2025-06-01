"use client"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "./dashboard-sidebar"
import { useEffect, useState } from "react"
import { SIDEBAR_STATUS } from "@/lib/const"

export function DashboardLayoutWrapper({ children, isAdmin, name, openState }: { children: React.ReactNode, isAdmin: boolean, name: string, openState: SIDEBAR_STATUS }) {
  const [sidebarOpen, setSidebarOpen] = useState(openState === SIDEBAR_STATUS.OPEN)
  const [mounted, setMounted] = useState(false)

  console.log(`client ss: ${openState}`)

  useEffect(() => {
    setMounted(true)
    if (openState === SIDEBAR_STATUS.NOT_SET){
      setSidebarOpen(window.innerWidth >= 1024)
    }
  }, [])

  if (!mounted) {
    return (
      <SidebarProvider defaultOpen={sidebarOpen}>
        <DashboardSidebar isAdmin={isAdmin} name={name} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="z-50" />
          </header>
          <main className="flex-1 w-full relative overflow-x-auto px-6 pt-4">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <DashboardSidebar isAdmin={isAdmin} name={name} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="z-50" />
        </header>
        <main className="flex-1 w-full relative overflow-x-auto px-6 lg:px-12 pt-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
