import type { Metadata } from "next"

import { RedeemForm } from "@/components/invite-redeem"

export const metadata: Metadata = {
	title: "redeem invite | dekcpe.link",
}

export default function InvitePage() {
	return (
		<div className="flex flex-1 items-center justify-center px-4 py-16">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<h1 className="text-3xl font-bold tracking-tight text-center">Redeem an Invite Code</h1>
				<RedeemForm />
			</div>
		</div>
	)
}
