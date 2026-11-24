"use client"

import { DataTable } from "@/components/data-table"
import { linkColumns } from "@/components/link-columns"
import { Badge } from "@/components/ui/badge"

interface Row {
	slug: string
	url: string
	createdAt: Date
	clickCount: number
	createdBy: string | null
}

const columns = (linkable: boolean) =>
	linkColumns<Row>({
		detailHref: linkable ? (slug) => `/d/link/${slug}` : undefined,
		extra: [
			{ accessorKey: "createdBy", header: "Created by", cell: ({ row }) => row.original.createdBy ?? "—" },
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

export function GroupLinksTable({ data, linkable }: { data: Row[]; linkable: boolean }) {
	return (
		<DataTable
			columns={columns(linkable)}
			data={data}
			rowHref={linkable ? (row) => `/d/link/${row.slug}` : undefined}
			emptyState="No links in this group."
		/>
	)
}
