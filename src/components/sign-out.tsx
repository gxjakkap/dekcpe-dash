"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"

export default function SignOut() {
	return (
		<Button variant="outline" onClick={signOut}>
			Sign Out
		</Button>
	)
}
