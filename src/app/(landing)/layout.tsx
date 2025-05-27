import { redirect } from "next/navigation"
import { headers } from "next/headers"

import FooterSection from "@/components/sections/footer"
import Navbar from "@/components/sections/navbar"
import { auth } from "@/lib/auth"

export default async function LandingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session) {
    redirect("/d")
  }

  return (
    <>
        <Navbar showNavigation={false} />
            {children}
        <FooterSection />
    </>
  )
}
