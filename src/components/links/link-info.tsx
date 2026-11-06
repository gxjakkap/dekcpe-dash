"use client"

import { Calendar, Clock, Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export default function LinkInfo({
	slug,
	dest,
	dateCreated,
	dateModified,
	className,
}: {
	slug: string
	dest: string
	dateCreated: string
	dateModified: string
	className?: string
}) {
	// biome-ignore lint/style/noNonNullAssertion: <NEXT_PUBLIC_SHORTLINK_BASE_URL shouldn't be null anyway>
	const shortlink = new URL(slug, process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL!).toString()
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="text-lg">Link Details</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<div className="text-sm font-medium text-muted-foreground">Link</div>
						<div className="flex items-center gap-2">
							<div className="font-mono text-sm bg-muted text-brand p-2 rounded flex-1 truncate">
								{shortlink}
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="text-muted-foreground"
								aria-label="Copy short link"
								onClick={(e) => {
									e.stopPropagation()
									navigator.clipboard.writeText(shortlink)
									toast.success(`Copied ${shortlink}`)
								}}>
								<Copy className="h-4 w-4" />
							</Button>
						</div>
					</div>
					<div className="space-y-2">
						<div className="text-sm font-medium text-muted-foreground">Destination</div>
						<div className="flex items-center gap-2">
							<div className="font-mono text-sm bg-muted p-2 rounded flex-1 truncate">{dest}</div>
							<a
								href={dest}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Open destination in new tab"
								className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 rounded-md p-2.5">
								<ExternalLink className="h-4 w-4 text-muted-foreground" />
							</a>
						</div>
					</div>
					<div className="space-y-2">
						<div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
							<Calendar className="h-4 w-4" />
							Created
						</div>
						<div className="text-sm">{dateCreated}</div>
					</div>
					<div className="space-y-2">
						<div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
							<Clock className="h-4 w-4" />
							Modified
						</div>
						<div className="text-sm">{dateModified}</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
