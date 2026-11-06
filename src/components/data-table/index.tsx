/**
 * Shamelessly stolen from https://github.com/gxjakkap/cc36staffapp
 *
 * Original author: beambeambeam
 *
 */

"use client"

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	type PaginationState,
	type Updater,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { parseAsInteger, useQueryState } from "nuqs"
import { type ReactNode, useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTableViewOptions } from "./column-toggle"
import { DataTablePagination } from "./pagination"

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	rowHref?: (row: TData) => string
	emptyState?: ReactNode
	toolbar?: ReactNode
}

const pageParam = parseAsInteger.withOptions({ history: "push", scroll: false, shallow: true })

export function DataTable<TData, TValue>({
	columns,
	data,
	rowHref,
	emptyState = "No results.",
	toolbar,
}: DataTableProps<TData, TValue>) {
	const router = useRouter()
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [page, setPage] = useQueryState("page", pageParam.withDefault(1))
	const [perPage, setPerPage] = useQueryState("perPage", pageParam.withDefault(10))

	const pagination: PaginationState = { pageIndex: page - 1, pageSize: perPage }

	function onPaginationChange(updaterOrValue: Updater<PaginationState>) {
		const next = typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue
		void setPage(next.pageIndex + 1)
		void setPerPage(next.pageSize)
	}

	const table = useReactTable({
		data,
		columns,
		state: { columnVisibility, pagination },
		onPaginationChange,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		autoResetPageIndex: false,
	})

	return (
		<div className="flex w-full flex-col gap-4">
			<div className="flex gap-x-2">
				<Input
					placeholder="Search"
					aria-label="Search"
					value={table.getState().globalFilter ?? ""}
					onChange={(event) => table.setGlobalFilter(event.target.value)}
					className="max-w-[10rem] lg:max-w-sm"
				/>
				<DataTableViewOptions table={table} />
				{toolbar}
			</div>
			<div className="w-full rounded-sm border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										className="first:pl-4 last:pr-4"
										style={{ width: `${header.getSize()}px` }}>
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className={rowHref ? "cursor-pointer" : undefined}
									onClick={
										rowHref
											? (e) => {
													// links and buttons in the row, and dialogs portalled out of it, handle their own clicks
													const target = e.target as Element
													if (!e.currentTarget.contains(target) || target.closest("a, button")) return
													router.push(rowHref(row.original))
												}
											: undefined
									}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="first:pl-4 last:pr-4">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
									{emptyState}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<DataTablePagination table={table} />
		</div>
	)
}
