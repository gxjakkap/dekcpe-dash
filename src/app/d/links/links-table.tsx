"use client"

import Link from "next/link"
import { parseAsInteger, parseAsString, useQueryState } from "nuqs"
import { BulkLinkActions } from "@/components/bulk-link-actions"
import { DataTable } from "@/components/data-table"
import { linkColumns } from "@/components/link-columns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { bulkDeleteLinks, bulkMoveLinks } from "./bulk-actions"

interface LinksRow {
	slug: string
	url: string
	createdAt: Date
	clickCount: number
	group: string
	createdBy: string | null
}

const detailHref = (slug: string) => `/d/link/${slug}`

const columns = linkColumns<LinksRow>({
	detailHref,
	extra: [
		{ accessorKey: "group", header: "Group" },
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

const ALL = "all"

export function LinksTable({ data, groups }: { data: LinksRow[]; groups: { id: number; name: string }[] }) {
	const [group, setGroup] = useQueryState("group", parseAsString.withOptions({ shallow: false }))
	const [, setPage] = useQueryState("page", parseAsInteger)
	// the server ignores unknown ids, so the select does too
	const current = groups.some((g) => String(g.id) === group) ? (group as string) : ALL

	return (
		<DataTable
			toolbar={
				<Select
					value={current}
					onValueChange={(v) => {
						void setPage(null)
						void setGroup(v === ALL ? null : v)
					}}>
					<SelectTrigger className="w-48">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ALL}>All groups</SelectItem>
						{groups.map((g) => (
							<SelectItem key={g.id} value={String(g.id)}>
								{g.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			}
			columns={columns}
			data={data}
			getRowId={(row) => row.slug}
			bulkActions={(selected, clear) => (
				<BulkLinkActions
					slugs={selected.map((r) => r.slug)}
					targets={groups}
					move={bulkMoveLinks}
					remove={bulkDeleteLinks}
					clear={clear}
				/>
			)}
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
