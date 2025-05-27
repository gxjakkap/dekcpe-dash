"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"


import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useTransition } from "react"
import { LoaderCircle } from "lucide-react"
import { redeemInviteCode } from "@/app/(noaccess)/invite/actions"
import { RedeemInviteCodeStatus } from "@/app/(noaccess)/invite/types"

const formSchema = z.object({
    code: z.string({ message: "Invite code must be a string" }).min(3, { message: "Invite code must be longer that 3 letters" })
})

export function RedeemForm() {
    const [isPending, startTransition] = useTransition()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: ""
        }
    })

    const onSubmit = (val : z.infer<typeof formSchema>) => {
        startTransition(async() => {
            try {
                const [res, error] = await redeemInviteCode({ code: val.code })

                if (!res || !!error){
                    toast(`Error occurred! (${error.message})`)
                    return
                }

                if (res.status === RedeemInviteCodeStatus.MAX_USED){
                    toast(`Invite code "${res.code}" has reach its max usage limit!`)
                }
                else if (res.status === RedeemInviteCodeStatus.INVALID){
                    toast(`Invite code "${res.code}" is invalid!`)
                }
                else if (res.status === RedeemInviteCodeStatus.UNNECESSARY){
                    toast(`You already have access to dekcpe.link!`)
                    window.location.href = "/"
                }
                else if (res.status === RedeemInviteCodeStatus.OK){
                    toast("Invite code redeemed successfully")
                    window.location.href = "/"
                }
                else {
                    toast(`Unknown error occurred!`)
                }

                
            } 
            catch (error) {
                toast(`Unknown error occurred!`)
                console.error(error)
            }
        })

    }

    return (
        <>
            {(isPending 
            ? (
                <LoaderCircle className="w-16 h-16 mx-auto animate-spin" />
            ) 
            : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-3">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Invite Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter it here."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="mx-auto w-full">
                            Redeem
                        </Button>
                    </form>
                </Form>
            ))}
        </>
    )

}