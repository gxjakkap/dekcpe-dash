import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession, requireUser } from "@/lib/session"
import { RedeemForm } from "./redeem-form"

export const metadata: Metadata = {
	title: "redeem invite | dekcpe.link",
}

export default async function InvitePage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
	const { code } = await searchParams
	if (!(await getSession())) {
		const next = code ? `/invite?code=${encodeURIComponent(code)}` : "/invite"
		redirect(`/sign-in?next=${encodeURIComponent(next)}`)
	}
	await requireUser(["no-access"])

	return (
		<div className="max-w-container mx-auto grid w-full flex-1 content-center gap-12 px-4 py-24 md:grid-cols-12 md:px-16">
			<h1 className="text-display leading-[1.02] md:col-span-6">Redeem an Invite Code</h1>
			<div className="md:col-span-5 md:col-start-8 md:self-end">
				<RedeemForm code={code} />
			</div>
		</div>
	)
}
