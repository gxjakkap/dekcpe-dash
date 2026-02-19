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
			<div className="flex flex-col w-2/3 mx-auto gap-y-12">
				<h3 className="text-3xl">Create new shortlink</h3>
				<Card className="p-4">
					<CreateLinkForm />
				</Card>
			</div>
		</div>
	)
}
