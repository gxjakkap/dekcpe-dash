"use client"

import { type ReactNode, useState } from "react"
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

interface DeleteDialogProps {
	title: string
	description: string
	confirmLabel: string
	/** Resolves true once deleted; the dialog stays open otherwise. */
	onConfirm: () => Promise<boolean>
	children: ReactNode
}

export function DeleteDialog({ title, description, confirmLabel, onConfirm, children }: DeleteDialogProps) {
	const [open, setOpen] = useState(false)
	const [isPending, setPending] = useState(false)

	// not a transition: zsa's execute settles inside its own transition, which would wait on this one
	const confirm = async () => {
		setPending(true)
		const deleted = await onConfirm()
		setPending(false)
		if (deleted) setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={isPending}>
							Cancel
						</Button>
					</DialogClose>
					<Button variant="destructive" onClick={confirm} disabled={isPending}>
						{isPending ? "Deleting…" : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
