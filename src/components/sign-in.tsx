"use client"
import { LoaderCircle } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { signIn } from "@/lib/auth-client"

export default function SignIn() {
	const [loading, setLoading] = useState(false)

	return (
		<div className="flex max-w-md flex-col gap-6">
			<h1 className="text-display-s leading-[1.02]">Sign In</h1>
			<p className="text-lead text-muted-foreground">
				Use your KMUTT Microsoft account to access <span className="text-foreground">dekcpe.link</span>.
			</p>
			<div>
						<Button
							size="lg"
							className="gap-3"
							disabled={loading}
							aria-busy={loading}
							onClick={async () => {
								await signIn.social(
									{
										provider: "microsoft",
										callbackURL: "/d",
									},
									{
										onRequest: (_ctx) => {
											setLoading(true)
										},
										onResponse: (_ctx) => {
											setLoading(false)
										},
									}
								)
							}}>
							{loading ? (
								<LoaderCircle className="animate-spin" />
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="1em"
									height="1em"
									viewBox="0 0 24 24"
									aria-hidden="true">
									<path fill="currentColor" d="M2 3h9v9H2zm9 19H2v-9h9zM21 3v9h-9V3zm0 19h-9v-9h9z"></path>
								</svg>
							)}
							{loading ? "Signing In…" : "Sign In with Microsoft"}
						</Button>
			</div>
		</div>
	)
}
