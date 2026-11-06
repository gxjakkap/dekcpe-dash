"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Copy, ExternalLink } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { InitialStateTablePage } from "@/types"
import { DataTable } from "./tablecomponents"

export interface LinksColumn {
	id: string
	slug: string
	url: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
	clickCount: number
}

interface LinksTableProps {
	data: LinksColumn[]
	initialState?: InitialStateTablePage
}

export function LinksTable(props: LinksTableProps) {
	const columns: (ColumnDef<LinksColumn> & { accessorKey: string })[] = [
		{
			accessorKey: "idx",
			header: "#",
			cell: ({ row }) => {
				return <div className="text-muted-foreground font-mono text-sm">{row.index + 1}</div>
			},
		},
		{
			accessorKey: "slug",
			header: "Short Link",
			cell: ({ row }) => {
				const shortUrl = new URL(
					row.getValue("slug"),
					process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL || "https://dekcpe.link/"
				)
					.toString()
					.replace("https://", "")
					.replace("http://", "")
				return (
					<div className="flex items-center gap-2 w-full">
						<Link
							href={`/d/link/${row.getValue("slug")}`}
							onClick={(e) => e.stopPropagation()}
							className="bg-muted px-2 py-1 rounded text-sm font-mono truncate flex-1 whitespace-nowrap hover:underline">
							{shortUrl}
						</Link>
						<Button
							variant="ghost"
							size="icon"
							aria-label="Copy short link"
							onClick={(e) => {
								e.stopPropagation()
								navigator.clipboard.writeText(`https://${shortUrl}`)
								toast(`Link ${shortUrl} copied to clipboard!`)
							}}>
							<Copy className="h-4 w-4" />
						</Button>
					</div>
				)
			},
		},
		{
			accessorKey: "url",
			header: "Destination",
			cell: ({ row }) => {
				const url = row.getValue("url") as string
				return (
					<div className="flex items-center gap-2 max-w-md">
						<span className="truncate text-sm">{url}</span>
						<ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
					</div>
				)
			},
		},
		{
			accessorKey: "clickCount",
			header: "Clicks",
			cell: ({ row }) => {
				const clicks = row.getValue("clickCount") as number
				return (
					<Badge variant={clicks > 0 ? "default" : "secondary"} className="font-mono">
						{clicks.toLocaleString()}
					</Badge>
				)
			},
		},
		{
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) => {
				const date = row.getValue("createdAt") as Date
				return <div className="text-sm text-muted-foreground">{date.toLocaleDateString()}</div>
			},
		},
	]
	return (
		<DataTable
			columns={columns}
			data={props.data}
			initialState={props.initialState}
			rowClickable={true}
			hrefPrefix="d/link/"
			hrefColumn={
				columns.find(
					(c): c is ColumnDef<LinksColumn> & { accessorKey: keyof LinksColumn } => c.accessorKey === "slug"
				) ?? undefined
			}
			isLoading={false}
			className="w-full"
		/>
	)
}
