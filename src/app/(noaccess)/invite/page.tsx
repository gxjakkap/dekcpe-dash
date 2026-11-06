import type { Metadata } from "next"

import { RedeemForm } from "./redeem-form"

export const metadata: Metadata = {
	title: "redeem invite | dekcpe.link",
}

export default function InvitePage() {
	return (
		<div className="max-w-container mx-auto grid w-full flex-1 content-center gap-12 px-4 py-24 md:grid-cols-12 md:px-16">
			<h1 className="text-display leading-[1.02] md:col-span-6">Redeem an Invite Code</h1>
			<div className="md:col-span-5 md:col-start-8 md:self-end">
				<RedeemForm />
			</div>
		</div>
	)
}
