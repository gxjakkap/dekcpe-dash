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

const ACTIONS: NavbarActionProps[] = [{ text: "Sign In", href: "/d", isButton: true, variant: "default" }]

export default function Navbar({
	customActionComponent = null,
	showNavigation = true,
	customNavigation,
	className,
}: NavbarProps) {
	return (
		<header className={cn("sticky top-0 z-50 -mb-4 px-4 pb-4", className)}>
			<div className="fade-bottom bg-background/15 absolute left-0 h-24 w-full backdrop-blur-lg"></div>
			<div className="max-w-container relative mx-auto">
				<NavbarComponent>
					<NavbarLeft>
						<Link href={"/d"} className="flex items-center gap-2 text-xl font-bold">
							<h3 className="text-xl font-bold">dekcpe.link 🔗</h3>
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
									<a key={action.href} href={action.href} className="hidden text-sm md:block">
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
								<nav className="grid gap-6 text-lg font-medium">
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
