"use client"

import { useServerAction } from "zsa-react"
import { toast } from "sonner"
import z from "zod"


import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { deleteShortLink } from "@/app/d/link/[slug]/actions"
import { FormEvent } from "react"

interface LinkDeleteDialogProps {
    slug: string;
    children: React.ReactNode;
}

const requestSchema = z.object({
    slug: z.string()
})

export default function LinkDeleteDialog({ slug, children }: LinkDeleteDialogProps) {
    const { execute } = useServerAction(deleteShortLink)

    const submitHandle = async(e: FormEvent) => {
        e.preventDefault()
        console.log(`form submitted`)

        const request = requestSchema.parse({
            slug: slug,
        })
        const [data, err] = await execute(request)

        if (err){
            toast(`${err.message} (${err.code})`)
            return
        }

        location.href = "/d/links"
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete {`/${slug}`}</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Are you sure you want to delete this link? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <form onSubmit={(e: FormEvent) => submitHandle(e)}>
                        <Button variant="destructive">Confirm</Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}