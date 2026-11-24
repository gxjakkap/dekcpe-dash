import { RefractLight } from "@/components/refract-light"
import { requireAccess } from "@/lib/session"
import SignIn from "./sign-in-button"

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
	await requireAccess(["signed-out"])
	const { next } = await searchParams
	// same-origin paths only, so the param can't become an open redirect
	const callbackURL = next?.startsWith("/") && !next.startsWith("//") ? next : "/d"

	return (
		<main className="max-w-container mx-auto grid min-h-dvh w-full gap-10 p-4 md:grid-cols-12 md:p-6">
			<div className="flex flex-col justify-center px-4 py-16 md:col-span-5 md:px-10">
				<SignIn callbackURL={callbackURL} />
			</div>
			<RefractLight className="hidden rounded-card md:col-span-7 md:block" />
		</main>
	)
}
