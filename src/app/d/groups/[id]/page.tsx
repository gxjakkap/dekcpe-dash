import { notFound } from "next/navigation"
import { getMembership } from "@/db/groups"
import { requireUser } from "@/lib/session"
import { GroupDetail } from "./group-detail"

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
	const session = await requireUser()
	const { id } = await params
	const groupId = /^\d+$/.test(id) ? Number(id) : 0
	if (!Number.isSafeInteger(groupId) || groupId < 1) notFound()

	const membership = await getMembership(groupId, session.user.id)
	if (!membership) notFound()

	return <GroupDetail groupId={groupId} controls={membership.isOwner ? "owner" : "member"} />
}
