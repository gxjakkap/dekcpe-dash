"use client"

import { DataTable } from "@/components/data-table"
import { linkColumns } from "@/components/link-columns"

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

export function AdminLinksTable({ data }: { data: AdminLinksRow[] }) {
	return <DataTable columns={columns} data={data} />
}
