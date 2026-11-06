"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Copy, Download, Link } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useServerAction } from "zsa-react"
import { createShortLink } from "@/app/d/links/create/actions"
import { stripProtocol } from "@/lib/utils"
import { Button } from "./ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"

const formSchema = z.object({
	slug: z
		.string()
		.length(0)
		.or(
			z
				.string()
				.min(4, { message: "Slug must be at least 4 characters." })
				.regex(/^[a-zA-Z0-9_-]+$/, "Slug can only contain letters, numbers, hyphens, and underscores.")
		)
		.optional(),
	url: z.string().regex(/^https?:\/\/[^\s<>"]+$/, "Enter a full URL that starts with http:// or https://"),
})

export default function CreateLinkForm() {
	const { execute, isPending } = useServerAction(createShortLink)
	const router = useRouter()
	const [genQr, setGenQr] = useState(false)
	const [shortLink, setShortLink] = useState("")

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { slug: "", url: "" },
	})

	const onSubmit = async (val: z.infer<typeof formSchema>) => {
		const [data, err] = await execute(val)

		if (err) {
			if (err.code === "SlugAlreadyExistedError") {
				form.setError("slug", { message: err.message })
			} else {
				toast.error(err.message)
			}
			return
		}

		setShortLink(data.link)
	}

	const createAnother = () => {
		form.reset({ slug: "", url: "" })
		setShortLink("")
	}

	if (shortLink) {
		const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(`${shortLink}?utm_source=dekcpe-qr`)}`
		return (
			<div className="flex flex-col items-center gap-6 py-4 text-center">
				<div className="flex flex-col gap-2">
					<p className="text-muted-foreground">Your short link is ready</p>
					<p className="font-mono text-2xl md:text-3xl font-semibold text-brand break-all">
						{stripProtocol(shortLink)}
					</p>
				</div>
				{genQr && (
					<div className="flex flex-col items-center gap-2">
						<Image
							src={qrUrl}
							alt={`QR code for ${stripProtocol(shortLink)}`}
							width={240}
							height={240}
							// loaded straight from qrserver: resizing a QR code gains nothing, and the optimizer would need the host allowlisted
							unoptimized
							className="rounded-md border bg-white p-2"
						/>
						<Button variant="ghost" size="sm" asChild>
							<a href={qrUrl} target="_blank" rel="noopener noreferrer" download>
								<Download /> Download QR Code
							</a>
						</Button>
					</div>
				)}
				<div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
					<Button variant="outline" onClick={createAnother}>
						Create Another Link
					</Button>
					<Button
						onClick={() => {
							navigator.clipboard.writeText(shortLink)
							toast.success(`Copied ${stripProtocol(shortLink)}`)
							router.push("/d/links")
						}}>
						<Copy /> Copy and Close
					</Button>
				</div>
			</div>
		)
	}

	return (
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
										<span className="text-muted-foreground my-auto">
											{stripProtocol(process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL || "dekcpe.link/")}
										</span>
										<Input placeholder="Leave blank to auto-generate" {...field} className="flex-1 w-full" />
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
									<Input inputMode="url" placeholder="https://cpe.kmutt.ac.th/" {...field} className="w-full" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex gap-x-2 items-center">
						<Label htmlFor="gen-qr">Generate a QR code</Label>
						<Switch id="gen-qr" checked={genQr} onCheckedChange={setGenQr} />
					</div>
					<Button type="submit" disabled={isPending}>
						<Link /> {isPending ? "Creating…" : "Create Link"}
					</Button>
				</div>
			</form>
		</Form>
	)
}
