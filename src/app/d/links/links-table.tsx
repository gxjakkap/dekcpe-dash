"use client"

import Link from "next/link"
import { DataTable } from "@/components/data-table"
import { linkColumns } from "@/components/link-columns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface LinksRow {
	slug: string
	url: string
	createdAt: Date
	clickCount: number
}

const detailHref = (slug: string) => `/d/link/${slug}`

const columns = linkColumns<LinksRow>({
	detailHref,
	extra: [
		{
			accessorKey: "clickCount",
			header: "Clicks",
			cell: ({ row }) => (
				<Badge variant="secondary" className="font-mono">
					{row.original.clickCount.toLocaleString()}
				</Badge>
			),
		},
	],
})

export function LinksTable({ data }: { data: LinksRow[] }) {
	return (
		<DataTable
			columns={columns}
			data={data}
			rowHref={(row) => detailHref(row.slug)}
			emptyState={
				<div className="flex flex-col items-center gap-3 font-normal">
					<p>No links yet.</p>
					<Button size="sm" asChild>
						<Link href="/d/links/create">Create Your First Link</Link>
					</Button>
				</div>
			}
		/>
	)
}
