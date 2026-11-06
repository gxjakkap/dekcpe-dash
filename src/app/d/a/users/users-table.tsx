"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { DataTable } from "@/components/data-table"
import { DeleteDialog } from "@/components/delete-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { ROLE_LABELS, ROLES } from "@/lib/const"
import { deleteUser, setUserRole } from "./actions"

interface UserRow {
	id: string
	name: string
	email: string
	role: string
	banned: boolean
}

const roleLabel = (role: string) => ROLE_LABELS[role as ROLES] ?? role

function EditRoleDialog({ user }: { user: UserRow }) {
	const [open, setOpen] = useState(false)
	const [role, setRole] = useState(user.role)
	const { execute, isPending } = useServerAction(setUserRole)
	const router = useRouter()

	const save = async () => {
		const [, err] = await execute({ id: user.id, role: role as ROLES })
		if (err) {
			toast.error(err.message)
			return
		}
		toast.success(`Updated ${user.name}`)
		setOpen(false)
		router.refresh()
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" aria-label={`Edit ${user.name}`} className="h-8 w-8 p-0">
					<Pencil className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit User</DialogTitle>
					<DialogDescription>
						{user.name} ({user.email})
					</DialogDescription>
				</DialogHeader>
				<div className="grid grid-cols-4 items-center gap-4 py-4">
					<Label className="text-right">Role</Label>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="w-32">
								{roleLabel(role)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56">
							<DropdownMenuLabel>Role</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuRadioGroup value={role} onValueChange={setRole}>
								{Object.values(ROLES).map((r) => (
									<DropdownMenuRadioItem key={r} value={r}>
										{ROLE_LABELS[r]}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
						Cancel
					</Button>
					<Button onClick={save} disabled={isPending}>
						{isPending ? "Saving…" : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

function UserActions({ user }: { user: UserRow }) {
	const { execute } = useServerAction(deleteUser)
	const router = useRouter()

	const onDelete = async () => {
		const [, err] = await execute({ id: user.id })
		if (err) {
			toast.error(err.message)
			return false
		}
		toast.success(`Deleted ${user.name}`)
		router.refresh()
		return true
	}

	return (
		<div className="flex gap-2">
			<EditRoleDialog user={user} />
			<DeleteDialog
				title={`Delete ${user.name}?`}
				description="Their account will be removed. This can't be undone."
				confirmLabel="Delete User"
				onConfirm={onDelete}>
				<Button
					variant="ghost"
					size="icon"
					aria-label={`Delete ${user.name}`}
					className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
					<Trash2 className="h-4 w-4" />
				</Button>
			</DeleteDialog>
		</div>
	)
}

const columns: ColumnDef<UserRow>[] = [
	{ accessorKey: "name", header: "Name" },
	{ accessorKey: "email", header: "Email" },
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => {
			const { role } = row.original
			return <Badge variant={role === ROLES.ADMIN ? "outline" : "secondary"}>{roleLabel(role)}</Badge>
		},
	},
	{
		accessorKey: "banned",
		header: "Status",
		cell: ({ row }) =>
			row.original.banned ? (
				<Badge variant="destructive">Banned</Badge>
			) : (
				<span className="text-muted-foreground">Active</span>
			),
	},
	{
		id: "action",
		header: "Action",
		cell: ({ row }) => <UserActions user={row.original} />,
	},
]

export function AdminUserTable({ data }: { data: UserRow[] }) {
	return <DataTable columns={columns} data={data} />
}
