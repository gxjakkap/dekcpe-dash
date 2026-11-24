"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LogOutIcon, SettingsIcon, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useServerAction } from "zsa-react"
import { SectionCard } from "@/components/dashboard-page"
import { DeleteDialog } from "@/components/delete-dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { groupNameSchema } from "@/lib/groups"
import { deleteGroupAction, leaveGroupAction, renameGroupAction } from "../actions"

const schema = z.object({ name: groupNameSchema })

function RenameForm({ groupId, name }: { groupId: number; name: string }) {
	const { execute, isPending } = useServerAction(renameGroupAction)
	const router = useRouter()
	const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name } })

	const onSubmit = async (val: z.infer<typeof schema>) => {
		const [, err] = await execute({ groupId, name: val.name })
		if (err) {
			toast.error(err.message)
			return
		}
		toast.success("Group renamed")
		router.refresh()
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-x-2">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem className="w-64">
							<FormControl>
								<Input aria-label="Group name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Saving…" : "Rename"}
				</Button>
			</form>
		</Form>
	)
}

export function GroupSettings({
	groupId,
	name,
	controls,
}: {
	groupId: number
	name: string
	controls: "owner" | "member"
}) {
	const del = useServerAction(deleteGroupAction)
	const leave = useServerAction(leaveGroupAction)
	const router = useRouter()

	const done = async (res: Promise<readonly [unknown, { message: string } | null]>, ok: string) => {
		const [, err] = await res
		if (err) {
			toast.error(err.message)
			return false
		}
		toast.success(ok)
		router.push("/d/groups")
		return true
	}

	return (
		<SectionCard icon={SettingsIcon} title="Settings">
			<div className="flex flex-col gap-4">
				{controls === "owner" ? (
					<>
						<RenameForm groupId={groupId} name={name} />
						<div>
							<DeleteDialog
								title={`Delete ${name}?`}
								description="The group and all its links will stop working. An admin can restore it."
								confirmLabel="Delete Group"
								onConfirm={() => done(del.execute({ groupId }), "Group deleted")}>
								<Button variant="destructive">
									<Trash2 /> Delete Group
								</Button>
							</DeleteDialog>
						</div>
					</>
				) : (
					<div>
						<DeleteDialog
							title={`Leave ${name}?`}
							description="You will lose access to this group's links. The owner can add you back."
							confirmLabel="Leave Group"
							onConfirm={() => done(leave.execute({ groupId }), "You left the group")}>
							<Button variant="outline">
								<LogOutIcon /> Leave Group
							</Button>
						</DeleteDialog>
					</div>
				)}
			</div>
		</SectionCard>
	)
}
