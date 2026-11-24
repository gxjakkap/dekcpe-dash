"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useServerAction } from "zsa-react"
import { type GroupOption, GroupSelect } from "@/components/group-select"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { destinationSchema } from "@/lib/links"
import { editShortLink } from "../actions"

const formSchema = z.object({ url: destinationSchema, groupId: z.number().int() })

export default function EditLinkForm({
	slug,
	dest,
	groupId,
	groups,
}: {
	slug: string
	dest: string
	groupId: number
	groups: GroupOption[]
}) {
	const { execute, isPending } = useServerAction(editShortLink)
	const router = useRouter()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { url: dest, groupId },
	})

	const onSubmit = async (val: z.infer<typeof formSchema>) => {
		const [, err] = await execute({ slug, ...val })

		if (err) {
			toast.error(err.message)
			return
		}

		const urlChanged = val.url !== dest
		const groupChanged = val.groupId !== groupId
		const groupName = groups.find((g) => g.id === val.groupId)?.name
		toast.success(
			urlChanged && groupChanged
				? `/${slug} now points to ${val.url} in ${groupName}`
				: groupChanged
					? `Moved /${slug} to ${groupName}`
					: `/${slug} now points to ${val.url}`
		)
		router.push(`/d/link/${slug}`)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="flex flex-col w-full gap-y-6 mx-auto">
					<FormField
						control={form.control}
						name="url"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-lg">Destination URL</FormLabel>
								<FormControl>
									<Input inputMode="url" placeholder="https://cpe.kmutt.ac.th/" {...field} className="w-full" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="groupId"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-lg">Group</FormLabel>
								<GroupSelect groups={groups} value={field.value} onChange={field.onChange} />
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" disabled={isPending || !form.formState.isDirty}>
						<Save /> {isPending ? "Saving…" : "Save Changes"}
					</Button>
				</div>
			</form>
		</Form>
	)
}
