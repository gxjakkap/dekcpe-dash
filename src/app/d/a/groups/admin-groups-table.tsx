"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { type AdminGroup, GroupAdminButtons } from "./group-admin-buttons"

export interface AdminGroupRow extends AdminGroup {
	members: number
}

const columns: ColumnDef<AdminGroupRow>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => (
			<Link href={`/d/a/groups/${row.original.id}`} className="font-medium hover:underline">
				{row.original.name}
			</Link>
		),
	},
	{ accessorKey: "owner", header: "Owner", cell: ({ row }) => row.original.owner ?? "—" },
	{ accessorKey: "members", header: "Members" },
	{ accessorKey: "links", header: "Links" },
	{
		id: "status",
		header: "Status",
		cell: ({ row }) => (
			<Badge variant={row.original.deleted ? "destructive" : "secondary"}>
				{row.original.deleted ? "Deleted" : "Active"}
			</Badge>
		),
	},
	{ id: "actions", header: "Actions", cell: ({ row }) => <GroupAdminButtons group={row.original} /> },
]

export function AdminGroupsTable({ data }: { data: AdminGroupRow[] }) {
	return <DataTable columns={columns} data={data} rowHref={(row) => `/d/a/groups/${row.id}`} />
}
