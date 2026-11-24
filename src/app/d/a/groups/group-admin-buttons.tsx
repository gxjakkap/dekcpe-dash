"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { restoreGroupAction, takeOwnershipAction } from "./actions"

export interface AdminGroup {
	id: number
	name: string
	owner: string | null
	isOwner: boolean
	deleted: boolean
	/** live links, or for a deleted group the links deleted with it */
	links: number
}

function ConfirmButton({
	label,
	title,
	description,
	action,
	done,
}: {
	label: string
	title: string
	description: string
	action: () => Promise<[unknown, { message: string } | null]>
	done: string
}) {
	const [open, setOpen] = useState(false)
	const [pending, setPending] = useState(false)
	const router = useRouter()

	const confirm = async () => {
		setPending(true)
		const [, err] = await action()
		setPending(false)
		if (err) {
			toast.error(err.message)
			return
		}
		toast.success(done)
		setOpen(false)
		router.refresh()
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
					{label}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
						Cancel
					</Button>
					<Button onClick={confirm} disabled={pending}>
						{pending ? "Working…" : label}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export function GroupAdminButtons({ group }: { group: AdminGroup }) {
	const takeOwnership = useServerAction(takeOwnershipAction)
	const restore = useServerAction(restoreGroupAction)

	if (group.deleted) {
		const noun = `${group.links} ${group.links === 1 ? "link" : "links"}`
		return (
			<ConfirmButton
				label="Restore"
				title={`Restore ${group.name}?`}
				description={`${group.name} and the ${noun} deleted with it come back.${group.owner ? "" : " You'll become its owner."}`}
				action={() => restore.execute({ groupId: group.id })}
				done={`Restored ${group.name}`}
			/>
		)
	}
	if (group.isOwner) return null
	return (
		<ConfirmButton
			label="Take ownership"
			title={`Take ownership of ${group.name}?`}
			description={`You'll become the owner of ${group.name}.${group.owner ? ` ${group.owner} stays as a member.` : ""}`}
			action={() => takeOwnership.execute({ groupId: group.id })}
			done={`You now own ${group.name}`}
		/>
	)
}
