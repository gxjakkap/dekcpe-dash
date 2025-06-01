import { Edit, ExternalLink, Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export default function LinkActions(){
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="default">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Link
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visit Link
                    </Button>
                    <div className="pt-2 border-t">
                        <Button className="w-full justify-start" variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Link
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}