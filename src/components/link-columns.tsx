"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { CopyButton } from "@/components/copy-button"
import { shortLinkUrl } from "@/lib/links"
import { formatDate, stripProtocol } from "@/lib/utils"

interface LinkRow {
	slug: string
	url: string
	createdAt: Date
}

export function linkColumns<T extends LinkRow>({
	detailHref,
	extra = [],
}: {
	detailHref?: (slug: string) => string
	extra?: ColumnDef<T>[]
}): ColumnDef<T>[] {
	return [
		{
			id: "idx",
			header: "#",
			cell: ({ row }) => <div className="text-muted-foreground font-mono text-sm">{row.index + 1}</div>,
		},
		{
			accessorKey: "slug",
			header: "Short Link",
			cell: ({ row }) => {
				const { slug } = row.original
				const url = shortLinkUrl(slug)
				const className = "bg-muted text-brand px-2 py-1 rounded text-sm font-mono truncate flex-1 whitespace-nowrap"
				return (
					<div className="flex items-center gap-2 w-full">
						{detailHref ? (
							<Link href={detailHref(slug)} className={`${className} hover:underline`}>
								{stripProtocol(url)}
							</Link>
						) : (
							<code className={className}>{stripProtocol(url)}</code>
						)}
						<CopyButton value={url} />
					</div>
				)
			},
		},
		{
			accessorKey: "url",
			header: "Destination",
			cell: ({ row }) => (
				<div className="flex items-center gap-2 max-w-md">
					<span className="truncate text-sm">{row.original.url}</span>
					<ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
				</div>
			),
		},
		...extra,
		{
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) => <div className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</div>,
		},
	]
}
