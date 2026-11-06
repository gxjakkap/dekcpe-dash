import FooterSection from "@/components/sections/footer"
import Navbar from "@/components/sections/navbar"
import { requireAccess } from "@/lib/session"

export default async function LandingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	await requireAccess(["signed-out"])

	return (
		<>
			<Navbar />
			{children}
			<FooterSection />
		</>
	)
}
