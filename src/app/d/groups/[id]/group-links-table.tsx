"use client"

import { BulkLinkActions } from "@/components/bulk-link-actions"
import { DataTable } from "@/components/data-table"
import { linkColumns } from "@/components/link-columns"
import { Badge } from "@/components/ui/badge"
import { bulkDeleteLinks, bulkMoveLinks } from "../../links/bulk-actions"

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

export function GroupLinksTable({
	data,
	linkable,
	moveTargets,
	bulk = false,
}: {
	data: Row[]
	linkable: boolean
	moveTargets: { id: number; name: string }[]
	/** show row selection with move/delete */
	bulk?: boolean
}) {
	return (
		<DataTable
			columns={columns(linkable)}
			data={data}
			getRowId={(row) => row.slug}
			rowLabel={(row) => row.slug}
			bulkActions={
				bulk
					? (selected, clear) => (
							<BulkLinkActions
								slugs={selected.map((r) => r.slug)}
								targets={moveTargets}
								move={bulkMoveLinks}
								remove={bulkDeleteLinks}
								clear={clear}
							/>
						)
					: undefined
			}
			rowHref={linkable ? (row) => `/d/link/${row.slug}` : undefined}
			emptyState="No links in this group."
		/>
	)
}
