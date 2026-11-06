"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { redeemInviteCode } from "@/app/(noaccess)/invite/actions"
import { RedeemInviteCodeStatus } from "@/app/(noaccess)/invite/types"
import { Button } from "./ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"

const formSchema = z.object({
	code: z
		.string({ message: "Enter your invite code." })
		.min(3, { message: "Invite codes are at least 3 characters." }),
})

export function RedeemForm() {
	const [isPending, startTransition] = useTransition()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			code: "",
		},
	})

	const onSubmit = (val: z.infer<typeof formSchema>) => {
		startTransition(async () => {
			try {
				const [res, error] = await redeemInviteCode({ code: val.code })

				if (!res || !!error) {
					toast.error(error?.message ?? "Couldn't redeem the code. Try again.")
					return
				}

				if (res.status === RedeemInviteCodeStatus.MAX_USED) {
					form.setError("code", { message: `${res.code} has been used the maximum number of times.` })
				} else if (res.status === RedeemInviteCodeStatus.INVALID) {
					form.setError("code", { message: `${res.code} isn't a valid invite code. Check it and try again.` })
				} else if (res.status === RedeemInviteCodeStatus.UNNECESSARY) {
					toast.success("You already have access to dekcpe.link.")
					window.location.href = "/d"
				} else if (res.status === RedeemInviteCodeStatus.OK) {
					toast.success("Invite code redeemed. Welcome to dekcpe.link!")
					window.location.href = "/d"
				} else {
					toast.error("Couldn't redeem the code. Try again.")
				}
			} catch (error) {
				toast.error("Couldn't redeem the code. Try again.")
				console.error(error)
			}
		})
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-3">
				<FormField
					control={form.control}
					name="code"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Invite Code</FormLabel>
							<FormControl>
								<Input placeholder="e.g. CPE36-WELCOME" autoComplete="off" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="mx-auto w-full" disabled={isPending}>
					{isPending && <LoaderCircle className="animate-spin" />}
					{isPending ? "Redeeming…" : "Redeem"}
				</Button>
			</form>
		</Form>
	)
}
