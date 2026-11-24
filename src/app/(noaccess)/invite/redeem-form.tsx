"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useServerAction } from "zsa-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { redeemCodeSchema } from "@/lib/invites"
import { redeemInviteCode } from "./actions"

const formSchema = z.object({ code: redeemCodeSchema })

export function RedeemForm({ code = "" }: { code?: string }) {
	const { execute, isPending } = useServerAction(redeemInviteCode)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { code },
	})

	// an invite link (/invite?code=…) redeems on arrival; the ref stops Strict Mode's second effect run from redeeming twice
	const autoSubmitted = useRef(false)
	useEffect(() => {
		if (!code || autoSubmitted.current) return
		autoSubmitted.current = true
		form.handleSubmit(onSubmit)()
	})

	const onSubmit = async (val: z.infer<typeof formSchema>) => {
		const [res, err] = await execute(val)

		if (err) {
			form.setError("code", { message: err.message })
			return
		}

		toast.success(
			res.alreadyHadAccess ? "You already have access to dekcpe.link." : "Invite code redeemed. Welcome to dekcpe.link!"
		)
		window.location.href = "/d"
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<FormField
					control={form.control}
					name="code"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Invite Code</FormLabel>
							<FormControl>
								<Input
									placeholder="e.g. CPE36-WELCOME"
									autoComplete="off"
									className="h-12 rounded-inner bg-light px-4 text-base"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" size="lg" className="w-full" disabled={isPending} aria-busy={isPending}>
					{isPending && <LoaderCircle className="animate-spin" />}
					{isPending ? "Redeeming…" : "Redeem"}
				</Button>
			</form>
		</Form>
	)
}
