import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import FooterSection from "@/components/sections/footer"
import Navbar from "@/components/sections/navbar"
import { auth } from "@/lib/auth"
import { ROLES, SIDEBAR_STATUS } from "@/lib/const"
import { DashboardLayoutWrapper } from "@/components/dashboard-layout-wrapper"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) redirect("/sign-in")
  if (session.user.role === ROLES.UNAUTHORIZED) redirect("/no-access")
  if (session.user.banned) redirect("/banned")

  const openState = (await cookies()).get("dekcpesidebarstate")?.value

  console.log(`ss cookie: ${openState}`)

  let ss: SIDEBAR_STATUS

  if (typeof openState === undefined){
    ss = SIDEBAR_STATUS.NOT_SET
  }
  else if (openState === "true"){
    ss = SIDEBAR_STATUS.OPEN
  }
  else {
    ss = SIDEBAR_STATUS.CLOSE
  }

  console.log(`ss: ${ss}`)

  return (
    <>
      <DashboardLayoutWrapper isAdmin={session.user.role === ROLES.ADMIN} name={session.user.name} openState={ss} >
        {children}
      </DashboardLayoutWrapper>
      <FooterSection />
    </>
  )
}
