"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { CrownIcon, UserMinusIcon, UserPlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useServerAction } from "zsa-react"
import { DataTable } from "@/components/data-table"
import { DeleteDialog } from "@/components/delete-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/utils"
import { addMemberAction, removeMemberAction, transferOwnershipAction } from "../actions"
import type { GroupControls } from "./group-detail"

interface MemberRow {
	userId: string
	name: string
	email: string
	joinedAt: Date
	isOwner: boolean
}

const emailSchema = z.object({ email: z.string().trim().min(1, { message: "Enter an email." }) })

function AddMemberDialog({ groupId }: { groupId: number }) {
	const [open, setOpen] = useState(false)
	const { execute, isPending } = useServerAction(addMemberAction)
	const router = useRouter()
	const form = useForm<z.infer<typeof emailSchema>>({
		resolver: zodResolver(emailSchema),
		defaultValues: { email: "" },
	})

	const onSubmit = async (val: z.infer<typeof emailSchema>) => {
		const [, err] = await execute({ groupId, email: val.email })
		if (err) {
			toast.error(err.message)
			return
		}
		toast.success("Member added")
		form.reset()
		setOpen(false)
		router.refresh()
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				setOpen(o)
				if (!o) form.reset()
			}}>
			<DialogTrigger asChild>
				<Button>
					<UserPlusIcon /> Add Member
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add Member</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="Member's email" className="mt-1" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter className="mt-4 flex justify-end space-x-2">
							<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Adding…" : "Add Member"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

function RowActions({ groupId, member }: { groupId: number; member: MemberRow }) {
	const remove = useServerAction(removeMemberAction)
	const transfer = useServerAction(transferOwnershipAction)
	const router = useRouter()

	const run = async (res: Promise<readonly [unknown, { message: string } | null]>, ok: string) => {
		const [, err] = await res
		if (err) {
			toast.error(err.message)
			return false
		}
		toast.success(ok)
		router.refresh()
		return true
	}

	if (member.isOwner) return null
	return (
		<div className="flex gap-x-1">
			<DeleteDialog
				title={`Make ${member.name} the owner?`}
				description="They will be able to manage members and delete the group. You stay a member."
				confirmLabel="Make Owner"
				destructive={false}
				pendingLabel="Saving…"
				onConfirm={() => run(transfer.execute({ groupId, userId: member.userId }), `${member.name} is now the owner`)}>
				<Button variant="ghost" size="icon" aria-label={`Make ${member.name} the owner`} className="h-8 w-8 p-0">
					<CrownIcon className="h-4 w-4" />
				</Button>
			</DeleteDialog>
			<DeleteDialog
				title={`Remove ${member.name}?`}
				description="They lose access to this group's links. Links they created stay in the group."
				confirmLabel="Remove"
				pendingLabel="Removing…"
				onConfirm={() => run(remove.execute({ groupId, userId: member.userId }), `Removed ${member.name}`)}>
				<Button
					variant="ghost"
					size="icon"
					aria-label={`Remove ${member.name}`}
					className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
					<UserMinusIcon className="h-4 w-4" />
				</Button>
			</DeleteDialog>
		</div>
	)
}

export function MembersTable({
	data,
	groupId,
	controls,
}: {
	data: MemberRow[]
	groupId: number
	controls: GroupControls
}) {
	const columns = useMemo<ColumnDef<MemberRow>[]>(
		() => [
			{ accessorKey: "name", header: "Name" },
			{ accessorKey: "email", header: "Email" },
			{
				id: "role",
				header: "Role",
				cell: ({ row }) => (
					<Badge variant={row.original.isOwner ? "default" : "secondary"}>
						{row.original.isOwner ? "Owner" : "Member"}
					</Badge>
				),
			},
			{ accessorKey: "joinedAt", header: "Joined", cell: ({ row }) => formatDate(row.original.joinedAt) },
			...(controls === "owner"
				? [
						{
							id: "action",
							header: "Action",
							cell: ({ row }) => <RowActions groupId={groupId} member={row.original} />,
						} satisfies ColumnDef<MemberRow>,
					]
				: []),
		],
		[controls, groupId]
	)
	return (
		<DataTable
			paramPrefix="members"
			columns={columns}
			data={data}
			toolbar={controls === "owner" ? <AddMemberDialog groupId={groupId} /> : undefined}
		/>
	)
}
