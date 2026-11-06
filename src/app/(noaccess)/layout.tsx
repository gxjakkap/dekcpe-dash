import FooterSection from "@/components/sections/footer"
import Navbar from "@/components/sections/navbar"
import SignOut from "@/components/sign-out"
import { requireUser } from "@/lib/session"

export default async function NoAccessLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	await requireUser(["no-access"])

	return (
		<div className="flex flex-col min-h-screen">
			<Navbar action={<SignOut />} />

			<main className="flex flex-1 flex-col">{children}</main>

			<FooterSection />
		</div>
	)
}
