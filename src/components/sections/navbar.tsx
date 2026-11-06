import Link from "next/link"
import type { ReactNode } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export default function Navbar({ action }: { action?: ReactNode }) {
	return (
		<header className="relative z-50 w-full">
			<div className="max-w-container mx-auto px-4 md:px-16">
				<nav className="flex h-18 items-center justify-between">
					<Link href="/d" className="font-display text-xl font-medium tracking-[var(--tracking-display)]">
						dekcpe.link
					</Link>
					<div className="flex items-center justify-end gap-4">
						<ThemeToggle />
						{action ?? (
							<Button variant="outline" asChild>
								<Link href="/d">Sign In</Link>
							</Button>
						)}
					</div>
				</nav>
			</div>
		</header>
	)
}
