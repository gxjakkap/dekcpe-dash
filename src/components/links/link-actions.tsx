import { Edit, ExternalLink, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import Link from "next/link";
import LinkDeleteDialog from "./delete/link-delete-dialog";


interface LinkActionsProps {
    slug: string,
    dest: string,
}

export default function LinkActions(props: LinkActionsProps) {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Link
                        href={`/d/link/${props.slug}/edit`}
                        className="block w-full"
                    >
                        <Button 
                            className="w-full justify-start"
                            variant="default"
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Link
                        </Button>
                    </Link>
                    <Link
                        href={props.dest}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                    >
                        <Button className="w-full justify-start" variant="outline">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Visit Link
                        </Button>
                    </Link>
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
        </>
    )
}