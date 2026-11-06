import { Card } from "@/components/ui/card"
import { requireUser } from "@/lib/session"
import CreateLinkForm from "./create-link-form"

export default async function CreateLinkPage() {
	await requireUser()

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
