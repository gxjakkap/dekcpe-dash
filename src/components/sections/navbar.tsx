import { Menu } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { Navbar as NavbarComponent, NavbarLeft, NavbarRight } from "../ui/navbar"
import Navigation from "../ui/navigation"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"

interface NavbarActionProps {
	text: string
	href: string
	variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
	icon?: ReactNode
	iconRight?: ReactNode
	isButton?: boolean
}

interface NavbarProps {
	showNavigation?: boolean
	customNavigation?: ReactNode
	customActionComponent?: ReactNode
	className?: string
}

// const HOME_URL = `https://dash.dekcpe.link/`
// const DASH_URL = new URL("/d", "https://dash.dekcpe.link/").toString()

const MOBILE_LINKS = [{ text: "Dashboard", href: "/d" }]

const ACTIONS: NavbarActionProps[] = [{ text: "Sign In", href: "/d", isButton: true, variant: "outline" }]

export default function Navbar({
	customActionComponent = null,
	showNavigation = true,
	customNavigation,
	className,
}: NavbarProps) {
	return (
		<header className={cn("relative z-50 w-full", className)}>
			<div className="max-w-container mx-auto px-4 md:px-16">
				<NavbarComponent className="h-18 py-0">
					<NavbarLeft>
						<Link href={"/d"} className="font-display text-xl font-medium tracking-[var(--tracking-display)]">
							dekcpe.link
						</Link>
						{showNavigation && (customNavigation || <Navigation />)}
					</NavbarLeft>
					<NavbarRight>
						{!customActionComponent &&
							ACTIONS.map((action) =>
								action.isButton ? (
									<Button key={action.href} variant={action.variant || "default"} asChild>
										<a href={action.href}>
											{action.icon}
											{action.text}
											{action.iconRight}
										</a>
									</Button>
								) : (
									<a key={action.href} href={action.href} className="hidden md:block">
										{action.text}
									</a>
								)
							)}
						{!!customActionComponent && <div className="flex items-center ml-2">{customActionComponent}</div>}
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon" className="shrink-0 md:hidden">
									<Menu className="size-5" />
									<span className="sr-only">Toggle navigation menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="right">
								<nav className="grid gap-6 p-6 text-lg">
									{MOBILE_LINKS.map((link) => (
										<a
											key={link.href}
											href={link.href}
											className="text-muted-foreground hover:text-foreground">
											{link.text}
										</a>
									))}
								</nav>
							</SheetContent>
						</Sheet>
					</NavbarRight>
				</NavbarComponent>
			</div>
		</header>
	)
}
