import { cn } from "@/lib/utils"
import { Footer, FooterBottom, FooterColumn, FooterContent } from "../ui/footer"

const FOOTER_COLUMNS = [
	{
		title: "CPE Student Union",
		links: [
			{ text: "Website", href: "https://cpesu.com" },
			{ text: "Instagram", href: "https://instagram.com/cpe_studentunion" },
			{ text: "Facebook", href: "https://www.facebook.com/student.cpe.kmutt" },
		],
	},
	{
		title: "CPE KMUTT",
		links: [
			{ text: "Website", href: "https://cpe.kmutt.ac.th/" },
			{ text: "Facebook", href: "https://www.facebook.com/cpe.kmutt" },
			{ text: "Instagram", href: "https://instagram.com/cpe.kmutt" },
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
						<div>© {new Date().getFullYear()} CPE KMUTT Student</div>
						<div className="flex items-center gap-4">
							{FOOTER_POLICIES.map((policy) => (
								<a key={policy.href} href={policy.href}>
									{policy.text}
								</a>
							))}
						</div>
					</FooterBottom>
				</Footer>
			</div>
		</footer>
	)
}
