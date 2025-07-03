"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form"
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"
import { Save } from "lucide-react"
import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../ui/alert-dialog"
import { editShortLink } from "@/app/d/link/[slug]/edit/actions"
import { useServerAction } from "zsa-react"
import { toast } from "sonner"

const formSchema = z.object({
    url: z.string().regex(/^https?:\/\/[^\s<>"]+$/, "Destination URL must be valid."),
})

const requestSchema = z.object({
    slug: z.string(),
    url: z.string().regex(/^https?:\/\/[^\s<>"]+$/, "Destination URL must be valid."),
})

export default function EditLinkForm({ slug }: { slug: string }) {
    const { execute } = useServerAction(editShortLink)
    const [successDialogOpen, setSuccessDialogOpen] = useState(false)


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema)
    })

    const onSubmit = async(val: z.infer<typeof formSchema>) => {
        const request = requestSchema.parse({
            slug: slug,
            url: val.url
        })
        const [data, err] = await execute(request)

        if (err){
            toast(`${err.message} (${err.code})`)
            return
        }

        setSuccessDialogOpen(true)
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-col w-full gap-y-6 mx-auto">
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">New Destination URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder={"https://cpe.kmutt.ac.th/"} {...field} className="w-full" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit"><Save />{" "}Save</Button>
                    </div>
                </form>
            </Form>
            {/** Success Dialog */}
            <AlertDialog
                open={successDialogOpen}
                onOpenChange={() => setSuccessDialogOpen(!successDialogOpen)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Success!</AlertDialogTitle>
                        <AlertDialogDescription>
                            Short link /{slug} is updated!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => {window.location.href = `/d/link/${slug}`}}>Back to {`/${slug}`} page</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}