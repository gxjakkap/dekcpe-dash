"use client"

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type Row,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table"
import { ChevronDown, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"
import { deleteUser, updateUser } from "@/app/d/a/users/actions"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ROLES } from "@/lib/const"

export interface UserColumn {
	id: string
	name: string
	email: string
	role: string
	banned: boolean | null
	banReason: string | null
}

interface UserTableProps {
	data: UserColumn[]
}

interface EditDialogProps {
	isOpen: boolean
	onClose: () => void
	data: UserColumn
	onUpdate: (data: Partial<UserColumn>) => void
	isPending: boolean
}

const EditDialog = ({ isOpen, onClose, data, onUpdate, isPending }: EditDialogProps) => {
	const [formData, setFormData] = React.useState<Partial<UserColumn>>({
		id: data.id,
		name: data.name,
		email: data.email,
		role: data.role,
		banned: data.banned,
		banReason: data.banReason,
	})

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit User</DialogTitle>
					<DialogDescription>
						{data.name} ({data.email})
					</DialogDescription>
				</DialogHeader>
				<form action={() => onUpdate(formData)}>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label className="text-right">Role</Label>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" className="w-32">
										{ROLE_LABELS[formData.role ?? ""] ?? formData.role}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56">
									<DropdownMenuLabel>Role</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuRadioGroup
										value={formData.role || "NULL"}
										onValueChange={(val) => setFormData({ ...formData, role: val })}>
										<DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="user">User</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="unauthorized">No Access</DropdownMenuRadioItem>
									</DropdownMenuRadioGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Saving…" : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

interface DeleteDialogProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
	userName: string
	isPending: boolean
}

const DeleteDialog = ({ isOpen, onClose, onConfirm, userName, isPending }: DeleteDialogProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Delete {userName}?</DialogTitle>
					<DialogDescription>Their account will be removed. This can&apos;t be undone.</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
						Cancel
					</Button>
					<Button type="button" variant="destructive" onClick={onConfirm} disabled={isPending}>
						{isPending ? "Deleting…" : "Delete User"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

const ActionCell = ({ row }: { row: Row<UserColumn> }) => {
	const [isEditOpen, setIsEditOpen] = React.useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
	const [isPending, startTransition] = React.useTransition()
	const router = useRouter()
	const data = row.original

	const handleUpdate = async (data: Partial<UserColumn>) => {
		startTransition(async () => {
			try {
				const [, err] = await updateUser({
					id: data.id as string,
					data: {
						...data,
						role: data.role as ROLES,
					},
				})
				if (err) throw new Error(err.message)
				toast.success(`Updated ${data.name}`)
				setIsEditOpen(false)
				router.refresh()
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Couldn't update this user. Try again.")
				console.error(error)
			}
		})
	}

	const handleDelete = async () => {
		startTransition(async () => {
			try {
				const [, err] = await deleteUser({
					id: data.id,
				})
				if (err) throw new Error(err.message)
				toast.success(`Deleted ${data.name}`)
				setIsDeleteOpen(false)
				router.refresh()
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Couldn't delete this user. Try again.")
				console.error(error)
			}
		})
	}

	return (
		<div className="flex gap-2">
			<Button
				variant="ghost"
				size="icon"
				aria-label={`Edit ${data.name}`}
				onClick={() => setIsEditOpen(true)}
				className="h-8 w-8 p-0"
				disabled={isPending}>
				<Pencil className="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				aria-label={`Delete ${data.name}`}
				onClick={() => setIsDeleteOpen(true)}
				className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
				disabled={isPending}>
				<Trash2 className="h-4 w-4" />
			</Button>

			<EditDialog
				isOpen={isEditOpen}
				onClose={() => setIsEditOpen(false)}
				data={data}
				onUpdate={handleUpdate}
				isPending={isPending}
			/>

			<DeleteDialog
				isOpen={isDeleteOpen}
				onClose={() => setIsDeleteOpen(false)}
				onConfirm={handleDelete}
				userName={`${data.name}`}
				isPending={isPending}
			/>
		</div>
	)
}

const ROLE_LABELS: Record<string, string> = {
	admin: "Admin",
	user: "User",
	unauthorized: "No Access",
}

const createColumns = (): ColumnDef<UserColumn>[] => [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => <div>{row.getValue("name")}</div>,
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => <div>{row.getValue("email")}</div>,
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => {
			const role = row.getValue("role") as string
			return <Badge variant={role === "admin" ? "outline" : "secondary"}>{ROLE_LABELS[role] ?? role}</Badge>
		},
	},
	{
		accessorKey: "banned",
		header: "Status",
		cell: ({ row }) =>
			row.getValue("banned") ? (
				<Badge variant="destructive">Banned</Badge>
			) : (
				<span className="text-muted-foreground">Active</span>
			),
	},
	{
		accessorKey: "action",
		header: "Action",
		cell: ({ row }) => <ActionCell row={row} />,
	},
]

const filterKeys: Array<keyof UserColumn> = ["name", "email"]

export function AdminUserTable({ data }: UserTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [globalFilter, setGlobalFilter] = React.useState<string>("")
	const [columnVisibility, _setColumnVisibility] = React.useState<VisibilityState>()
	const [rowSelection, setRowSelection] = React.useState({})

	const columns = React.useMemo(() => createColumns(), [])

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		initialState: {
			sorting: [
				{
					id: "role",
					desc: false,
				},
			],
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: (row, _columnId, filterValue) => {
			const searchValue = String(filterValue).toLowerCase()
			return filterKeys.some((key) => {
				const cellValue = String(row.original[key] || "").toLowerCase()
				return cellValue.includes(searchValue)
			})
		},
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			globalFilter,
		},
	})

	return (
		<div className="md:mx-10">
			<div className="flex items-center py-4">
				<Input
					placeholder="Search by name or email"
					aria-label="Search users"
					value={globalFilter}
					onChange={(event) => setGlobalFilter(event.target.value)}
					className="max-w-sm"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
							Columns <ChevronDown className="ml-2 h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) => column.toggleVisibility(!!value)}>
										{column.id}
									</DropdownMenuCheckboxItem>
								)
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader className="bg-neutral-100 dark:bg-background">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} users</div>
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}>
						Previous
					</Button>
					<Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
						Next
					</Button>
				</div>
			</div>
		</div>
	)
}
