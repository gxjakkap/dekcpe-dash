import { headers } from "next/headers"
import { redirect } from "next/navigation"
import CreateLinkForm from "@/components/create-links"
import { Card } from "@/components/ui/card"
import { auth } from "@/lib/auth"

export default async function CreateLinkPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session) {
		redirect("/sign-in")
	}

	return (
		<div className="flex flex-col w-full pt-4">
			<div className="flex flex-col w-full max-w-2xl mx-auto gap-y-8">
				<h1 className="text-3xl font-bold tracking-tight">Create Short Link</h1>
				<Card className="p-4">
					<CreateLinkForm />
				</Card>
			</div>
		</div>
	)
}
