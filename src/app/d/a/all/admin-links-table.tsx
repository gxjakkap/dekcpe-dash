"use client"

import { DataTable } from "@/components/data-table"
import { linkColumns } from "@/components/link-columns"

interface AdminLinksRow {
	slug: string
	url: string
	createdAt: Date
	owner: string
}

const columns = linkColumns<AdminLinksRow>({
	extra: [{ accessorKey: "owner", header: "Owner" }],
})

export function AdminLinksTable({ data }: { data: AdminLinksRow[] }) {
	return <DataTable columns={columns} data={data} />
}
