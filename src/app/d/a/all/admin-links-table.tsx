"use client"

import { DataTable } from "@/components/data-table"
import { linkColumns } from "@/components/link-columns"

interface AdminLinksRow {
	slug: string
	url: string
	createdAt: Date
	createdBy: string | null
}

const columns = linkColumns<AdminLinksRow>({
	extra: [{ accessorKey: "createdBy", header: "Created by" }],
})

export function AdminLinksTable({ data }: { data: AdminLinksRow[] }) {
	return <DataTable columns={columns} data={data} />
}
