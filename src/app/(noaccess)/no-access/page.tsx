import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NoAccessPage() {
	return (
		<div className="max-w-container mx-auto grid w-full flex-1 content-center gap-12 px-4 py-24 md:grid-cols-12 md:px-16">
			<h1 className="text-display leading-[1.02] md:col-span-6">You Don&apos;t Have Access Yet</h1>
			<div className="flex flex-col items-start gap-6 md:col-span-5 md:col-start-8 md:self-end">
				<p className="text-lead text-muted-foreground">
					dekcpe.link is for CPE students and staff. If someone gave you an invite code, redeem it to get
					access.
				</p>
				<Button size="lg" asChild>
					<Link href="/invite">Redeem an Invite Code</Link>
				</Button>
			</div>
		</div>
	)
}
