"use client"

import { Edit, ExternalLink, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { DeleteDialog } from "@/components/delete-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteShortLink } from "./actions"

export default function LinkActions({ slug, dest }: { slug: string; dest: string }) {
	const { execute } = useServerAction(deleteShortLink)
	const router = useRouter()

	const onDelete = async () => {
		const [, err] = await execute({ slug })
		if (err) {
			toast.error(err.message)
			return false
		}
		toast.success(`Deleted /${slug}`)
		router.push("/d/links")
		return true
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Actions</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<Button className="w-full justify-start" asChild>
					<Link href={`/d/link/${slug}/edit`}>
						<Edit className="mr-2 h-4 w-4" />
						Edit Link
					</Link>
				</Button>
				<Button className="w-full justify-start" variant="outline" asChild>
					<a href={dest} target="_blank" rel="noopener noreferrer">
						<ExternalLink className="mr-2 h-4 w-4" />
						Open Destination
					</a>
				</Button>
				<div className="pt-2 border-t">
					<DeleteDialog
						title={`Delete /${slug}?`}
						description="The short link will stop working right away. This can't be undone."
						confirmLabel="Delete Link"
						onConfirm={onDelete}>
						<Button className="w-full justify-start" variant="destructive">
							<Trash2 className="mr-2 h-4 w-4" />
							Delete Link
						</Button>
					</DeleteDialog>
				</div>
			</CardContent>
		</Card>
	)
}
