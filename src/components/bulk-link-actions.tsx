"use client"

import { FolderInputIcon, Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { DeleteDialog } from "@/components/delete-dialog"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Result = Promise<readonly [unknown, { message: string } | null]>

interface Props {
	slugs: string[]
	targets: { id: number; name: string }[]
	move: (input: { slugs: string[]; groupId: number }) => Result
	remove: (input: { slugs: string[] }) => Result
	clear: () => void
}

const plural = (n: number) => `${n} ${n === 1 ? "link" : "links"}`

export function BulkLinkActions({ slugs, targets, move, remove, clear }: Props) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [groupId, setGroupId] = useState("")
	const [isPending, setPending] = useState(false)

	const finish = async (res: Result, ok: string) => {
		const [, err] = await res
		if (err) {
			toast.error(err.message)
			return false
		}
		toast.success(ok)
		clear()
		router.refresh()
		return true
	}

	const confirmMove = async () => {
		setPending(true)
		const target = targets.find((g) => String(g.id) === groupId)
		const moved =
			target && (await finish(move({ slugs, groupId: target.id }), `Moved ${plural(slugs.length)} to ${target.name}`))
		setPending(false)
		if (moved) setOpen(false)
	}

	return (
		<>
			{targets.length > 0 && (
				<Dialog
					open={open}
					onOpenChange={(o) => {
						setOpen(o)
						if (o) setGroupId("")
					}}>
					<DialogTrigger asChild>
						<Button variant="outline" size="sm">
							<FolderInputIcon /> Move to group
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Move {plural(slugs.length)}</DialogTitle>
							<DialogDescription>Pick the group these links should belong to.</DialogDescription>
						</DialogHeader>
						<Select value={groupId} onValueChange={setGroupId}>
							<SelectTrigger aria-label="Target group">
								<SelectValue placeholder="Choose a group" />
							</SelectTrigger>
							<SelectContent>
								{targets.map((g) => (
									<SelectItem key={g.id} value={String(g.id)}>
										{g.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<DialogFooter>
							<Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
								Cancel
							</Button>
							<Button onClick={confirmMove} disabled={!groupId || isPending}>
								{isPending ? "Moving…" : "Move"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
			<DeleteDialog
				title={`Delete ${plural(slugs.length)}?`}
				description={`Delete ${slugs.length} ${slugs.length === 1 ? "link" : "links"}? They stop working right away.`}
				confirmLabel="Delete"
				onConfirm={() => finish(remove({ slugs }), `Deleted ${plural(slugs.length)}`)}>
				<Button variant="destructive" size="sm">
					<Trash2Icon /> Delete
				</Button>
			</DeleteDialog>
		</>
	)
}
