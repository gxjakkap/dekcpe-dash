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
	type RowSelectionState,
	type Updater,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { parseAsInteger, useQueryState } from "nuqs"
import { type ReactNode, useEffect, useMemo, useState } from "react"
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
	/** Namespaces the page/perPage URL params so several tables can share a page. */
	paramPrefix?: string
	/** Adds a checkbox column; rendered in the toolbar while rows are selected. Needs `getRowId`. */
	bulkActions?: (selected: TData[], clear: () => void) => ReactNode
	getRowId?: (row: TData) => string
}

const pageParam = parseAsInteger.withOptions({ history: "push", scroll: false, shallow: true })

export function DataTable<TData, TValue>({
	columns,
	data,
	rowHref,
	emptyState = "No results.",
	toolbar,
	paramPrefix,
	bulkActions,
	getRowId,
}: DataTableProps<TData, TValue>) {
	const router = useRouter()
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [page, setPage] = useQueryState(paramPrefix ? `${paramPrefix}Page` : "page", pageParam.withDefault(1))
	const [perPage, setPerPage] = useQueryState(
		paramPrefix ? `${paramPrefix}PerPage` : "perPage",
		pageParam.withDefault(10)
	)

	const pagination: PaginationState = { pageIndex: page - 1, pageSize: perPage }

	function onPaginationChange(updaterOrValue: Updater<PaginationState>) {
		const next = typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue
		void setPage(next.pageIndex + 1)
		void setPerPage(next.pageSize)
	}

	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	// fresh data (e.g. after router.refresh()) drops the selection
	// biome-ignore lint/correctness/useExhaustiveDependencies: data is the trigger
	useEffect(() => setRowSelection({}), [data])

	const allColumns = useMemo<ColumnDef<TData, TValue>[]>(
		() =>
			bulkActions
				? [
						{
							id: "select",
							enableHiding: false,
							header: ({ table }) => (
								<input
									type="checkbox"
									aria-label="Select all rows on this page"
									className="size-4 cursor-pointer accent-primary"
									checked={table.getIsAllPageRowsSelected()}
									onChange={table.getToggleAllPageRowsSelectedHandler()}
								/>
							),
							cell: ({ row }) => (
								<input
									type="checkbox"
									aria-label="Select row"
									className="size-4 cursor-pointer accent-primary"
									checked={row.getIsSelected()}
									onChange={row.getToggleSelectedHandler()}
								/>
							),
						},
						...columns,
					]
				: columns,
		[columns, bulkActions]
	)

	const table = useReactTable({
		data,
		columns: allColumns,
		getRowId: getRowId ? (row) => getRowId(row) : undefined,
		state: { columnVisibility, pagination, rowSelection },
		onRowSelectionChange: setRowSelection,
		onPaginationChange,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		autoResetPageIndex: false,
	})

	const selected = bulkActions ? table.getFilteredSelectedRowModel().rows.map((r) => r.original) : []

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
				{bulkActions && selected.length > 0 && (
					<div className="ml-auto flex items-center gap-x-2">
						<span className="text-sm text-muted-foreground">{selected.length} selected</span>
						{bulkActions(selected, () => setRowSelection({}))}
					</div>
				)}
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
													if (!e.currentTarget.contains(target) || target.closest("a, button, input")) return
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
								<TableCell
									colSpan={table.getVisibleLeafColumns().length}
									className="h-24 text-center text-muted-foreground">
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
