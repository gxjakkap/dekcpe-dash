"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { CreateGroupDialog } from "./create-group-dialog"

interface GroupRow {
	id: number
	name: string
	owner: string | null
	isOwner: boolean
	members: number
	links: number
}

const columns: ColumnDef<GroupRow>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => (
			<Link href={`/d/groups/${row.original.id}`} className="font-medium hover:underline">
				{row.original.name}
			</Link>
		),
	},
	{ accessorKey: "owner", header: "Owner", cell: ({ row }) => row.original.owner ?? "—" },
	{ accessorKey: "members", header: "Members" },
	{ accessorKey: "links", header: "Links" },
	{
		id: "role",
		header: "Your role",
		cell: ({ row }) => (
			<Badge variant={row.original.isOwner ? "default" : "secondary"}>
				{row.original.isOwner ? "Owner" : "Member"}
			</Badge>
		),
	},
]

export function GroupsTable({ data }: { data: GroupRow[] }) {
	return (
		<DataTable columns={columns} data={data} rowHref={(row) => `/d/groups/${row.id}`} toolbar={<CreateGroupDialog />} />
	)
}
