import Link from "next/link"
import { Card } from "@/components/ui/card"
import { userGroups } from "@/db/groups"
import { requireUser } from "@/lib/session"
import CreateLinkForm from "./create-link-form"

export default async function CreateLinkPage() {
	const session = await requireUser()
	const groups = await userGroups(session.user.id)

	return (
		<div className="flex flex-col w-full pt-4">
			<div className="flex flex-col w-full max-w-2xl mx-auto gap-y-8">
				<h1 className="text-3xl font-bold tracking-tight">Create Short Link</h1>
				<Card className="p-4">
					{groups.length > 0 ? (
						<CreateLinkForm groups={groups} />
					) : (
						<p>
							You are not in any group yet.{" "}
							<Link href="/d/groups" className="underline">
								Go to your groups
							</Link>
						</p>
					)}
				</Card>
			</div>
		</div>
	)
}
