import { Edit, ExternalLink, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import LinkDeleteDialog from "./delete/link-delete-dialog"

interface LinkActionsProps {
	slug: string
	dest: string
}

export default function LinkActions(props: LinkActionsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Actions</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<Button className="w-full justify-start" asChild>
					<Link href={`/d/link/${props.slug}/edit`}>
						<Edit className="mr-2 h-4 w-4" />
						Edit Link
					</Link>
				</Button>
				<Button className="w-full justify-start" variant="outline" asChild>
					<a href={props.dest} target="_blank" rel="noopener noreferrer">
						<ExternalLink className="mr-2 h-4 w-4" />
						Open Destination
					</a>
				</Button>
				<div className="pt-2 border-t">
					<LinkDeleteDialog slug={props.slug}>
						<Button className="w-full justify-start" variant="destructive">
							<Trash2 className="mr-2 h-4 w-4" />
							Delete Link
						</Button>
					</LinkDeleteDialog>
				</div>
			</CardContent>
		</Card>
	)
}
