import { cn } from "@/lib/utils"

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
		<footer className={cn("w-full bg-paper-2", className)}>
			<div className="max-w-container mx-auto flex flex-col gap-16 px-4 pt-24 pb-8 md:px-16">
				<div className="grid gap-12 md:grid-cols-12">
					<p className="font-display text-section leading-[1.02] tracking-[var(--tracking-display)] md:col-span-6">
						dekcpe.link
					</p>
					{FOOTER_COLUMNS.map((column, i) => (
						<div
							key={column.title}
							className={cn("flex flex-col gap-3 md:col-span-3", i === 0 && "md:col-start-7")}>
							<h2 className="font-sans text-sm font-medium tracking-normal text-muted-foreground">
								{column.title}
							</h2>
							<ul className="flex flex-col gap-2">
								{column.links.map((link) => (
									<li key={link.href}>
										<a
											href={link.href}
											className="underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline">
											{link.text}
										</a>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
				<div className="flex flex-col items-start justify-between gap-4 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
					<p>© {new Date().getFullYear()} CPE KMUTT Student</p>
					{FOOTER_POLICIES.length > 0 && (
						<div className="flex items-center gap-4">
							{FOOTER_POLICIES.map((policy) => (
								<a key={policy.href} href={policy.href}>
									{policy.text}
								</a>
							))}
						</div>
					)}
				</div>
			</div>
		</footer>
	)
}
