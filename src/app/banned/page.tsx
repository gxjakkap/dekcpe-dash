import type { Metadata } from "next"

import SignOut from "@/components/sign-out"
import { requireUser } from "@/lib/session"

export const metadata: Metadata = {
	title: "account suspended | dekcpe.link",
}

export default async function BannedPage() {
	const session = await requireUser(["banned"])

	return (
		<main className="flex min-h-screen items-center justify-center px-4">
			<div className="flex max-w-md flex-col items-center gap-4 text-center">
				<h1 className="text-3xl font-bold">Your Account Is Suspended</h1>
				<p className="text-muted-foreground">
					{session.user.banReason
						? `Reason: ${session.user.banReason}`
						: "Contact the CPE Student Union if you think this is a mistake."}
				</p>
				<SignOut />
			</div>
		</main>
	)
}
