"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { deleteShortLink } from "@/app/d/link/[slug]/actions"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"

interface LinkDeleteDialogProps {
	slug: string
	children: React.ReactNode
}

export default function LinkDeleteDialog({ slug, children }: LinkDeleteDialogProps) {
	const { execute, isPending } = useServerAction(deleteShortLink)
	const router = useRouter()

	const onDelete = async () => {
		const [, err] = await execute({ slug })

		if (err) {
			toast.error(err.message)
			return
		}

		toast.success(`Deleted /${slug}`)
		router.push("/d/links")
	}

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete /{slug}?</DialogTitle>
					<DialogDescription>
						The short link will stop working right away. This can&apos;t be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={isPending}>
							Cancel
						</Button>
					</DialogClose>
					<Button variant="destructive" onClick={onDelete} disabled={isPending}>
						{isPending ? "Deleting…" : "Delete Link"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
