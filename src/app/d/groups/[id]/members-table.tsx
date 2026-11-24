"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { CrownIcon, UserMinusIcon, UserPlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useServerAction } from "zsa-react"
import { DataTable } from "@/components/data-table"
import { DeleteDialog } from "@/components/delete-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
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

function AddMemberForm({ groupId }: { groupId: number }) {
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
		router.refresh()
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-x-2">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="email" placeholder="Member's email" aria-label="Member's email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={isPending}>
					<UserPlusIcon /> {isPending ? "Adding…" : "Add Member"}
				</Button>
			</form>
		</Form>
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
				onConfirm={() => run(transfer.execute({ groupId, userId: member.userId }), `${member.name} is now the owner`)}>
				<Button variant="ghost" size="icon" aria-label={`Make ${member.name} the owner`} className="h-8 w-8 p-0">
					<CrownIcon className="h-4 w-4" />
				</Button>
			</DeleteDialog>
			<DeleteDialog
				title={`Remove ${member.name}?`}
				description="They lose access to this group's links. Links they created stay in the group."
				confirmLabel="Remove"
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
			columns={columns}
			data={data}
			toolbar={controls === "owner" ? <AddMemberForm groupId={groupId} /> : undefined}
		/>
	)
}
