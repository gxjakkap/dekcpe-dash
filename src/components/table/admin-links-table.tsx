"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { formatDate, stripProtocol } from "@/lib/utils"
import type { InitialStateTablePage } from "@/types"
import { DataTable } from "./tablecomponents"

export interface AdminLinksColumn {
	id: string
	slug: string
	url: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
	owner: string
}

interface AdminLinksTableProps {
	data: AdminLinksColumn[]
	initialState?: InitialStateTablePage
}

export function AdminLinksTable(props: AdminLinksTableProps) {
	const columns: (ColumnDef<AdminLinksColumn> & { accessorKey: string })[] = [
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
				const shortUrl = stripProtocol(
					new URL(
						row.getValue("slug"),
						process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL || "https://dekcpe.link/"
					).toString()
				)
				return (
					<div className="flex items-center gap-2 w-full">
						<code className="bg-muted text-brand px-2 py-1 rounded text-sm font-mono truncate flex-1 whitespace-nowrap">
							{shortUrl}
						</code>
						<Button
							variant="ghost"
							size="icon"
							aria-label="Copy short link"
							onClick={(e) => {
								e.stopPropagation()
								navigator.clipboard.writeText(`https://${shortUrl}`)
								toast.success(`Copied ${shortUrl}`)
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
			accessorKey: "owner",
			header: "Owner",
			cell: ({ row }) => {
				return <div className="">{row.getValue("owner")}</div>
			},
		},
		{
			accessorKey: "createdAt",
			header: "Created",
			cell: ({ row }) => {
				const date = row.getValue("createdAt") as Date
				return <div className="text-sm text-muted-foreground">{formatDate(date)}</div>
			},
		},
	]
	return (
		<DataTable
			columns={columns}
			data={props.data}
			initialState={props.initialState}
			isLoading={false}
			className="w-full"
		/>
	)
}
