"use client"

import { zodResolver } from "@hookform/resolvers/zod"
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
import { format, startOfToday } from "date-fns"
import { CalendarIcon, ChevronDown, PlusIcon, Trash2 } from "lucide-react"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { createInviteCode, deleteInviteCode } from "@/app/d/a/invites/actions"

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
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
//import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Calendar } from "../ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Switch } from "../ui/switch"

export interface InviteColumn {
	id: number
	code: string
	currentUses: number
	usedBy: string[]
	maxUses: number
	createdBy: string
	creationDate: Date
	expirationDate: Date | null
}

interface InviteTableProps {
	data: InviteColumn[]
}

interface AddDialogProps {
	isOpen: boolean
	onClose: () => void
	onAdd: (data: z.infer<typeof addFormSchema>) => void
	isPending: boolean
}

const addFormSchema = z.object({
	code: z
		.string()
		.length(0, { message: "Custom invite code must be at least 4 characters long" })
		.or(z.string().min(4, { message: "Custom invite code must be at least 4 characters long" }))
		.optional(),
	maxUses: z
		.preprocess(
			(val) => {
				if (typeof val === "string") {
					const parsed = parseInt(val, 10)
					return Number.isNaN(parsed) ? undefined : parsed
				}
				return val
			},
			z.number().refine((val) => val === -1 || (val >= 1 && val <= 9999), {
				message: "Max uses must be between 1 and 9999.",
			})
		)
		.optional(),
	expirationDate: z.date().optional(),
})

const AddDialog = ({ isOpen, onClose, onAdd, isPending }: AddDialogProps) => {
	const [unlimited, setUnlimited] = React.useState(false)

	const handleSubmit = (val: z.infer<typeof addFormSchema>) => {
		onAdd({ ...val, maxUses: unlimited ? -1 : val.maxUses })
	}

	const addForm = useForm<z.infer<typeof addFormSchema>>({
		// biome-ignore lint/suspicious/noExplicitAny: <>
		resolver: zodResolver(addFormSchema as any),
		defaultValues: {
			code: "",
		},
	})

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Invite Code</DialogTitle>
				</DialogHeader>
				<Form {...addForm}>
					<form onSubmit={addForm.handleSubmit(handleSubmit)}>
						<div className="flex flex-col gap-y-4">
							<FormField
								control={addForm.control}
								name="code"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Code</FormLabel>
										<FormControl>
											<Input placeholder="Leave blank to auto-generate" className="mt-1" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex items-center gap-x-2">
								<Switch
									id="invite-unlimited"
									checked={unlimited}
									onCheckedChange={(checked) => {
										setUnlimited(checked)
										// a hidden, half-typed value would otherwise still fail validation
										addForm.setValue("maxUses", undefined)
									}}
								/>
								<Label htmlFor="invite-unlimited">Unlimited uses</Label>
							</div>
							{!unlimited && (
								<FormField
									control={addForm.control}
									name="maxUses"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Max Uses</FormLabel>
											<FormControl>
												<Input inputMode="numeric" placeholder="1" className="mt-1" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
							<FormField
								control={addForm.control}
								name="expirationDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Expiration Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-[240px] pl-3 text-left font-normal",
															!field.value && "text-muted-foreground"
														)}>
														{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) => date < startOfToday()}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<DialogFooter className="flex justify-end space-x-2 mt-4">
							<Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Creating…" : "Create Invite"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

interface DeleteDialogProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
	code: string
	isPending: boolean
}

const DeleteDialog = ({ isOpen, onClose, onConfirm, code, isPending }: DeleteDialogProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Delete Invite Code {code}?</DialogTitle>
					<DialogDescription>
						People who haven&apos;t redeemed it yet won&apos;t be able to. This can&apos;t be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
						Cancel
					</Button>
					<Button type="button" variant="destructive" onClick={onConfirm} disabled={isPending}>
						{isPending ? "Deleting…" : "Delete Invite"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

const ActionCell = (row: Row<InviteColumn>) => {
	const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
	const [isPending, startTransition] = React.useTransition()
	const data = row.original

	const handleDelete = async () => {
		startTransition(async () => {
			try {
				const [, err] = await deleteInviteCode({
					code: data.code,
				})
				if (err) throw new Error(err.message)
				toast.success(`Deleted invite code ${data.code}`)
				setIsDeleteOpen(false)
				location.reload()
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Couldn't delete this invite code. Try again.")
				console.error(error)
			}
		})
	}

	return (
		<div className="flex gap-2">
			<Button
				variant="ghost"
				size="icon"
				aria-label={`Delete invite ${data.code}`}
				onClick={() => setIsDeleteOpen(true)}
				className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
				disabled={isPending}>
				<Trash2 className="h-4 w-4" />
			</Button>

			<DeleteDialog
				isOpen={isDeleteOpen}
				onClose={() => setIsDeleteOpen(false)}
				onConfirm={handleDelete}
				code={data.code}
				isPending={isPending}
			/>
		</div>
	)
}

const createColumns = (): ColumnDef<InviteColumn>[] => [
	{
		accessorKey: "id",
		header: "ID",
		cell: ({ row }) => {
			return <div className="mx-auto">{row.getValue("id")}</div>
		},
	},
	{
		accessorKey: "code",
		header: "Invite Code",
		cell: ({ row }) => <div>{row.getValue("code")}</div>,
	},
	{
		accessorKey: "creationDate",
		header: "Creation Date",
		cell: ({ row }) => {
			const dateValue = row.getValue("creationDate")
			return <div className="mx-auto">{dateValue ? format(dateValue as Date, "PPP") : ""}</div>
		},
	},
	{
		accessorKey: "createdBy",
		header: "Creator",
		cell: ({ row }) => <div>{row.getValue("createdBy")}</div>,
	},
	{
		accessorKey: "maxUses",
		header: "Max Uses",
		cell: ({ row }) => {
			const maxUses = row.getValue("maxUses")
			return <div className="">{maxUses === -1 ? "∞" : maxUses?.toString()}</div>
		},
	},
	{
		accessorKey: "currentUses",
		header: "Current Uses",
		cell: ({ row }) => <div className="">{row.getValue("currentUses")}</div>,
	},
	{
		accessorKey: "expirationDate",
		header: "Expiration Date",
		cell: ({ row }) => {
			const dateValue = row.getValue("expirationDate")
			return <div>{dateValue ? format(dateValue as Date, "PPP") : "Never Expires"}</div>
		},
	},
	{
		accessorKey: "action",
		header: "Action",
		cell: ({ row }) => ActionCell(row),
	},
]

const filterKeys: Array<keyof InviteColumn> = ["id", "code"]

export function AdminInviteTable({ data }: InviteTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [isAddOpen, setIsAddOpen] = React.useState(false)
	const [globalFilter, setGlobalFilter] = React.useState<string>("")
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
	const [isCreatePending, startCreateTransition] = React.useTransition()
	const [rowSelection, setRowSelection] = React.useState({})

	const columns = React.useMemo(() => createColumns(), [])

	const handleCreate = async (data: z.infer<typeof addFormSchema>) => {
		startCreateTransition(async () => {
			try {
				const [res, err] = await createInviteCode(data)

				if (err) {
					toast.error(err.message)
					return
				}

				toast.success(`Created invite code ${res.code}`)
				setIsAddOpen(false)
				location.reload()
			} catch (error) {
				toast.error("Couldn't create the invite code. Try again.")
				console.error(error)
			}
		})
	}

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
		onColumnVisibilityChange: setColumnVisibility,
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
		<>
			<div className="md:mx-10">
				<div className="flex items-center py-4 gap-x-2">
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
					<Button onClick={() => setIsAddOpen(true)}>
						<PlusIcon /> New Invite Code
					</Button>
				</div>
				<div className="rounded-md border">
					<Table>
						<TableHeader className="bg-neutral-100 dark:bg-background">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(header.column.columnDef.header, header.getContext())}
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
											<TableCell key={cell.id}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
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
					<div className="flex-1 text-sm text-muted-foreground">
						{table.getFilteredRowModel().rows.length} invite codes
					</div>
					<div className="space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}>
							Next
						</Button>
					</div>
				</div>
			</div>
			<AddDialog
				isOpen={isAddOpen}
				onClose={() => setIsAddOpen(false)}
				onAdd={handleCreate}
				isPending={isCreatePending}
			/>
		</>
	)
}
