import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NoAccessPage() {
	return (
		<div className="flex flex-1 items-center justify-center px-4 py-16">
			<div className="flex max-w-md flex-col items-center gap-4 text-center">
				<h1 className="text-3xl font-bold tracking-tight">You Don&apos;t Have Access Yet</h1>
				<p className="text-muted-foreground">
					dekcpe.link is for CPE students and staff. If someone gave you an invite code, redeem it to get
					access.
				</p>
				<Button asChild>
					<Link href="/invite">Redeem an Invite Code</Link>
				</Button>
			</div>
		</div>
	)
}
