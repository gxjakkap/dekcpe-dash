"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useServerAction } from "zsa-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { groupNameSchema } from "@/lib/groups"
import { createGroupAction } from "./actions"

const schema = z.object({ name: groupNameSchema })

export function CreateGroupDialog() {
	const [open, setOpen] = useState(false)
	const { execute, isPending } = useServerAction(createGroupAction)
	const router = useRouter()
	const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: "" } })

	const onSubmit = async (val: z.infer<typeof schema>) => {
		const [res, err] = await execute(val)
		if (err) {
			toast.error(err.message)
			return
		}
		toast.success("Group created")
		setOpen(false)
		router.push(`/d/groups/${res.id}`)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<PlusIcon /> New Group
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Group</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input className="mt-1" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter className="flex justify-end space-x-2 mt-4">
							<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Creating…" : "Create Group"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
