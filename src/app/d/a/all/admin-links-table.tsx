"use client"

import { BulkLinkActions } from "@/components/bulk-link-actions"
import { DataTable } from "@/components/data-table"
import { linkColumns } from "@/components/link-columns"
import { adminBulkDeleteLinks, adminBulkMoveLinks } from "./actions"

interface AdminLinksRow {
	slug: string
	url: string
	createdAt: Date
	createdBy: string | null
	group: string
}

const columns = linkColumns<AdminLinksRow>({
	extra: [
		{ accessorKey: "group", header: "Group" },
		{ accessorKey: "createdBy", header: "Created by", cell: ({ row }) => row.original.createdBy ?? "—" },
	],
})

export function AdminLinksTable({ data, groups }: { data: AdminLinksRow[]; groups: { id: number; name: string }[] }) {
	return (
		<DataTable
			columns={columns}
			data={data}
			getRowId={(row) => row.slug}
			rowLabel={(row) => row.slug}
			bulkActions={(selected, clear) => (
				<BulkLinkActions
					slugs={selected.map((r) => r.slug)}
					targets={groups}
					move={adminBulkMoveLinks}
					remove={adminBulkDeleteLinks}
					clear={clear}
				/>
			)}
		/>
	)
}
