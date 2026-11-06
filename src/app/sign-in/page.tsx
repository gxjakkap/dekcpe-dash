import { RefractLight } from "@/components/refract-light"
import SignIn from "@/components/sign-in"

export default function SignInPage() {
	return (
		<main className="max-w-container mx-auto grid min-h-dvh w-full gap-10 p-4 md:grid-cols-12 md:p-6">
			<div className="flex flex-col justify-center px-4 py-16 md:col-span-5 md:px-10">
				<SignIn />
			</div>
			<RefractLight className="hidden rounded-card md:col-span-7 md:block" />
		</main>
	)
}
