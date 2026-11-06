"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { ColumnDef } from "@tanstack/react-table"
import { startOfToday } from "date-fns"
import { CalendarIcon, PlusIcon, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { useServerAction } from "zsa-react"
import { DataTable } from "@/components/data-table"
import { DeleteDialog } from "@/components/delete-dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { createInviteSchema, UNLIMITED_USES } from "@/lib/invites"
import { cn, formatDate } from "@/lib/utils"
import { createInviteCode, deleteInviteCode } from "./actions"

interface InviteRow {
	id: number
	code: string
	currentUses: number
	maxUses: number
	createdBy: string
	creationDate: Date
	expirationDate: Date | null
}

type CreateInviteValues = z.infer<typeof createInviteSchema>

function CreateInviteDialog() {
	const [open, setOpen] = useState(false)
	const [unlimited, setUnlimited] = useState(false)
	const { execute, isPending } = useServerAction(createInviteCode)
	const router = useRouter()

	const form = useForm<CreateInviteValues>({
		// biome-ignore lint/suspicious/noExplicitAny: maxUses is preprocessed, so the schema's input type is unknown
		resolver: zodResolver(createInviteSchema as any),
		defaultValues: { code: "" },
	})

	const onSubmit = async (val: CreateInviteValues) => {
		const [res, err] = await execute({ ...val, maxUses: unlimited ? UNLIMITED_USES : val.maxUses })
		if (err) {
			toast.error(err.message)
			return
		}
		toast.success(`Created invite code ${res.code}`)
		setOpen(false)
		form.reset()
		setUnlimited(false)
		router.refresh()
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<PlusIcon /> New Invite Code
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Invite Code</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className="flex flex-col gap-y-4">
							<FormField
								control={form.control}
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
										form.setValue("maxUses", undefined)
									}}
								/>
								<Label htmlFor="invite-unlimited">Unlimited uses</Label>
							</div>
							{!unlimited && (
								<FormField
									control={form.control}
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
								control={form.control}
								name="expirationDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Expiration Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														className={cn(
															"w-[240px] pl-3 text-left font-normal",
															!field.value && "text-muted-foreground"
														)}>
														{field.value ? formatDate(field.value) : <span>Pick a date</span>}
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
							<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
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

function DeleteInviteButton({ code }: { code: string }) {
	const { execute } = useServerAction(deleteInviteCode)
	const router = useRouter()

	const onDelete = async () => {
		const [, err] = await execute({ code })
		if (err) {
			toast.error(err.message)
			return false
		}
		toast.success(`Deleted invite code ${code}`)
		router.refresh()
		return true
	}

	return (
		<DeleteDialog
			title={`Delete Invite Code ${code}?`}
			description="People who haven't redeemed it yet won't be able to. This can't be undone."
			confirmLabel="Delete Invite"
			onConfirm={onDelete}>
			<Button
				variant="ghost"
				size="icon"
				aria-label={`Delete invite ${code}`}
				className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
				<Trash2 className="h-4 w-4" />
			</Button>
		</DeleteDialog>
	)
}

const columns: ColumnDef<InviteRow>[] = [
	{ accessorKey: "id", header: "ID" },
	{ accessorKey: "code", header: "Invite Code" },
	{
		accessorKey: "creationDate",
		header: "Creation Date",
		cell: ({ row }) => formatDate(row.original.creationDate),
	},
	{ accessorKey: "createdBy", header: "Creator" },
	{
		accessorKey: "maxUses",
		header: "Max Uses",
		cell: ({ row }) => (row.original.maxUses === UNLIMITED_USES ? "∞" : row.original.maxUses),
	},
	{ accessorKey: "currentUses", header: "Current Uses" },
	{
		accessorKey: "expirationDate",
		header: "Expiration Date",
		cell: ({ row }) => (row.original.expirationDate ? formatDate(row.original.expirationDate) : "Never Expires"),
	},
	{
		id: "action",
		header: "Action",
		cell: ({ row }) => <DeleteInviteButton code={row.original.code} />,
	},
]

export function AdminInviteTable({ data }: { data: InviteRow[] }) {
	return <DataTable columns={columns} data={data} toolbar={<CreateInviteDialog />} />
}
