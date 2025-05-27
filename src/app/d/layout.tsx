import { headers } from "next/headers"
import { redirect } from "next/navigation"

import FooterSection from "@/components/sections/footer"
import Navbar from "@/components/sections/navbar"
import { auth } from "@/lib/auth"
import { ROLES } from "@/lib/const"
import { DashboardLayoutWrapper } from "@/components/dashboard-layout-wrapper"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) redirect("/sign-in")
  if (session.user.role === ROLES.UNAUTHORIZED) redirect("/no-access")
  if (session.user.banned) redirect("/banned")

  return (
    <>
      <DashboardLayoutWrapper isAdmin={session.user.role === ROLES.ADMIN} name={session.user.name} >
        {children}
      </DashboardLayoutWrapper>
      <FooterSection />
    </>
  )
}
