"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Link } from "lucide-react"
import { useState } from "react"
import { Switch } from "./ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { createShortLink } from "@/app/d/links/create/actions"
import { useServerAction } from "zsa-react"
import { toast } from "sonner"

const formSchema = z.object({
    slug: z.string().length(0).or(z.string().min(4, { message: "Custom Slug must be longer than 4 characters" }).regex(/^[a-zA-Z0-9_-]+$/, "Slug must only contain alphanumerica characters, hyphens and underscore.")),
    url: z.string().regex(/^https?:\/\/[^\s<>"]+$/, "Destination URL must be valid."),
})

export default function CreateLinkForm(){
    const { isPending, execute, data, error } = useServerAction(createShortLink)
    const [genQr, setGenQr] = useState(false)
    const [shortLink, setShortLink] = useState("")
    const [successDialogOpen, setSuccessDialogOpen] = useState(false)

    console.log('genQr initial value:', genQr)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema)
    })

    const onSubmit = async(val: z.infer<typeof formSchema>) => {
        const [data, err] = await execute(val)

        if (err){
            toast(`${err.message} (${err.code})`)
            return
        }

        setShortLink(data.link)
        setSuccessDialogOpen(true)
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-col w-full gap-y-6 mx-auto">
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Slug</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-x-2">
                                            <span className="text-foreground/50 my-auto">{(`${process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL || "dekcpe.link"}`).replace("https://", "").replace("http://", "")}</span>
                                            <Input placeholder={"slug (leave blank to auto-generate)"} {...field} className="flex-1 w-full" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Destination URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder={"https://cpe.kmutt.ac.th/"} {...field} className="w-full" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-x-2 items-center">
                            <span>Generate a QR Code for this link</span>
                            <Switch
                                checked={genQr}
                                onCheckedChange={() => setGenQr(!genQr)}
                            />
                        </div>
                        <Button type="submit"><Link />{" "}Create Link</Button>
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
                            Short link {shortLink} is created!
                        </AlertDialogDescription>
                        {(successDialogOpen && genQr) && (
                            <div className="flex flex-col gap-y-1 mx-auto my-4">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL || "https://dekcpe.link/"}${shortLink}?utm_source=dekcpe-qr`} alt="qrcode" width={300} height={300} />
                                <a 
                                    className="underline text-blue-600 hover:text-sky-500 text-center"
                                    href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL || "https://dekcpe.link/"}${shortLink}?utm_source=dekcpe-qr`} 
                                    target="_blank"
                                    rel="noopener, noreferer"
                                    download
                                >
                                    Click here to download QR Code file
                                </a>
                            </div>
                        )}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => window.location.reload()}>Create Another Link</AlertDialogAction>
                        <AlertDialogAction onClick={() => {window.location.href = "/d/links"}}>Back to Links page</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}