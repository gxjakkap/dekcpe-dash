import { headers } from "next/headers"
import { redirect } from "next/navigation"

import FooterSection from "@/components/sections/footer"
import Navbar from "@/components/sections/navbar"
import SignOut from "@/components/sign-out"
import { auth } from "@/lib/auth"
import { ROLES } from "@/lib/const"

export default async function NoAccessLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		redirect("/sign-in")
	}

	if (session.user.role !== ROLES.UNAUTHORIZED) {
		redirect("/d")
	}

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar showNavigation={false} customActionComponent={<SignOut />} />

			<main className="flex flex-1 flex-col">{children}</main>

			<FooterSection />
		</div>
	)
}
