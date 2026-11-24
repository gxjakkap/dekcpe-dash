import { Card } from "@/components/ui/card"
import { memberGroupIds } from "@/db/groups"
import { groupMembers } from "@/db/schema"
import { requireUser } from "@/lib/session"
import CreateLinkForm from "./create-link-form"

export default async function CreateLinkPage() {
	const session = await requireUser()
	// ponytail: earliest-joined group as a hidden default until the group picker lands
	const [group] = await memberGroupIds(session.user.id).orderBy(groupMembers.joinedAt).limit(1)

	return (
		<div className="flex flex-col w-full pt-4">
			<div className="flex flex-col w-full max-w-2xl mx-auto gap-y-8">
				<h1 className="text-3xl font-bold tracking-tight">Create Short Link</h1>
				<Card className="p-4">
					{group ? <CreateLinkForm groupId={group.id} /> : <p>You are not in any group yet.</p>}
				</Card>
			</div>
		</div>
	)
}
