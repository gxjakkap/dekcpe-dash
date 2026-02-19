import { cn } from "@/lib/utils"
import { Footer, FooterBottom, FooterColumn, FooterContent } from "../ui/footer"
import { ModeToggle } from "../ui/mode-toggle"

const FOOTER_COLUMNS = [
	{
		title: "CPE Student Union",
		links: [
			{ text: "Instagram", href: "https://instagram.com/cpe_studentunion" },
			{ text: "Facebook", href: "https://www.facebook.com/student.cpe.kmutt" },
		],
	},
	{
		title: "CPE KMUTT",
		links: [
			{ text: "Website", href: "https://cpe.kmutt.ac.th/" },
			{ text: "Facebook", href: "https://www.facebook.com/cpe.kmutt" },
		],
	},
]

const FOOTER_POLICIES: { text: string; href: string }[] = [
	/** { text: "Privacy Policy", href: "https://www.launchuicomponents.com/" },
	{ text: "Terms of Service", href: "https://www.launchuicomponents.com/" }, **/
]

export default function FooterSection({ className }: { className?: string }) {
	return (
		<footer className={cn("bg-background w-full px-4", className)}>
			<div className="max-w-container mx-auto">
				<Footer>
					<FooterContent>
						<FooterColumn className="col-span-2 sm:col-span-3 md:col-span-1">
							<div className="flex items-center gap-2">
								<h3 className="text-xl font-bold">dekcpe.link 🔗</h3>
							</div>
						</FooterColumn>
						{FOOTER_COLUMNS.map((column) => (
							<FooterColumn key={column.title}>
								<h3 className="text-md pt-1 font-semibold">{column.title}</h3>
								{column.links.map((link) => (
									<a key={link.href} href={link.href} className="text-muted-foreground text-sm">
										{link.text}
									</a>
								))}
							</FooterColumn>
						))}
					</FooterContent>
					<FooterBottom>
						<div>© 2025 CPE KMUTT Student</div>
						<div className="flex items-center gap-4">
							{FOOTER_POLICIES.map((policy) => (
								<a key={policy.href} href={policy.href}>
									{policy.text}
								</a>
							))}
							<ModeToggle />
						</div>
					</FooterBottom>
				</Footer>
			</div>
		</footer>
	)
}
