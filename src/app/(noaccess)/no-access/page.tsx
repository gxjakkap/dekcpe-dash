import Link from "next/link"

import { Button } from "@/components/ui/button"
import { requireUser } from "@/lib/session"

export default async function NoAccessPage() {
	await requireUser(["no-access"])

	return (
		<div className="max-w-container mx-auto grid w-full flex-1 content-center gap-12 px-4 py-24 md:grid-cols-12 md:px-16">
			<h1 className="text-display leading-[1.02] md:col-span-6">You Don&apos;t Have Access Yet</h1>
			<div className="flex flex-col items-start gap-6 md:col-span-5 md:col-start-8 md:self-end">
				<p className="text-lead text-muted-foreground">
					dekcpe.link is for CPE students and staff. If someone gave you an invite code, redeem it to get access.
				</p>
				<Button size="lg" asChild>
					<Link href="/invite">Redeem an Invite Code</Link>
				</Button>
				<section className="flex flex-col gap-2 border-t pt-6">
					<h2 className="font-medium">No invite code?</h2>
					<p className="text-muted-foreground">
						Ask the CPE Student Union for access: send a DM to{" "}
						<a
							href="https://instagram.com/cpe_studentunion"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary underline underline-offset-4">
							@cpe_studentunion
						</a>{" "}
						on Instagram, or email{" "}
						<a href="mailto:studentunion@cpe.kmutt.ac.th" className="text-primary underline underline-offset-4">
							studentunion@cpe.kmutt.ac.th
						</a>
						.
					</p>
				</section>
			</div>
		</div>
	)
}
