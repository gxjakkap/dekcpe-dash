import FooterSection from "@/components/sections/footer"
import Navbar from "@/components/sections/navbar"
import SignOut from "@/components/sign-out"

// access is checked per page: /invite has to send signed-out visitors to sign-in with their code kept
export default function NoAccessLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="flex flex-col min-h-screen">
			<Navbar action={<SignOut />} />

			<main className="flex flex-1 flex-col">{children}</main>

			<FooterSection />
		</div>
	)
}
