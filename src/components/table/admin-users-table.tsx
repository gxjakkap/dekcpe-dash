"use client"

import * as React from "react"
import {
  ColumnDef,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
//import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { deleteUser, updateUser } from "@/app/d/a/users/actions"
import { ROLES } from "@/lib/const"


export interface UserColumn {
    id: string,
    name: string,
    email: string,
    role: string,
    banned: boolean | null,
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

const EditDialog = ({ 
    isOpen, 
    onClose, 
    data, 
    onUpdate,
    isPending 
}: EditDialogProps) => {
    const [formData, setFormData] = React.useState<Partial<UserColumn>>({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        banned: data.banned,
        banReason: data.banReason
    })

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
            <DialogHeader>
                    <DialogTitle>Edit User Information</DialogTitle>
                    <DialogDescription>
                        {data.name} ({data.email})
                    </DialogDescription>
                </DialogHeader>
                <form action={() => onUpdate(formData)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right capitalize">
                                Role
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-32">{formData.role?.replace(/([A-Z])/g, ' $1').trim()}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>Select user&apos;s role</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup value={formData.role || 'NULL'} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                                        <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="user">User</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="unauthorized">No Access</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                <DialogFooter>
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? "Saving..." : "Save changes"}
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

const DeleteDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    userName,
    isPending 
}: DeleteDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the user {userName}? 
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={onConfirm}
                        disabled={isPending}
                    >
                        {isPending ? "Deleting..." : "Delete"}
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
    const data = row.original

    const handleUpdate = async (data: Partial<UserColumn>) => {
        startTransition(async () => {
            try {
                await updateUser({
                    id: data.id as string,
                    data: {
                        ...data,
                        role: data.role as ROLES
                    }
                })
                toast("Record updated succesfully")
                setIsEditOpen(false)
            } 
            catch (error) {
                toast("Failed to update record")
                console.error(error)
            }
        })
    }

    const handleDelete = async () => {
        startTransition(async () => {
            try {
                await deleteUser({
                    id: data.id
                })
                toast("Record deleted succesfully")
                setIsDeleteOpen(false)
            } 
            catch (error) {
                toast("Failed to delete record")
                console.error(error)
            }
        })
    }

    return (
        <div className="flex gap-2">
            <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsEditOpen(true)}
                className="h-8 w-8 p-0"
                disabled={isPending}
            >
                <Pencil className="h-4 w-4" />
            </Button>
            <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsDeleteOpen(true)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                disabled={isPending}
            >
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

const createColumns = (): ColumnDef<UserColumn>[] => [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
            const shrt = (row.getValue("id") as string).substring(0, 4)
            return <div>{shrt}</div>
        },
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div>{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <div>{row.getValue("email")}</div>
        ),
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
            <div>{row.getValue("role")}</div>
        ),
    },
    {
        accessorKey: "banned",
        header: "Banned",
        cell: ({ row }) => {
            const banned = row.getValue("banned");
            return <div>{banned === null ? "N/A" : String(banned)}</div>
        },
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
            <ActionCell row={row} />
        ),
    },
]

const filterKeys: Array<keyof UserColumn> = [
    "id",
    "name",
    "email",
]

export function AdminUserTable({ data }: UserTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState<string>("")
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>()
    const [rowSelection, setRowSelection] = React.useState({})
    
    const columns = React.useMemo(
        () => createColumns(),
        []
    )

    console.log(data)
    
    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        initialState: {
            sorting: [
                {
                    id: 'role',
                    desc: false,
                }
            ]
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, columnId, filterValue) => {
            const searchValue = String(filterValue).toLowerCase();
            return filterKeys.some((key) => {
                const cellValue = String(row.original[key] || "").toLowerCase();
                return cellValue.includes(searchValue);
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
                {/* <Input
                    placeholder="Search"
                    value={table.getState().globalFilter ?? ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        table.setGlobalFilter(event.target.value)
                    }
                    className="max-w-sm"
                /> */}
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
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
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
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}