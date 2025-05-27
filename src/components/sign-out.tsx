"use client"

import { useRouter } from 'next/navigation'

import { authClient } from "@/lib/auth-client"
import { Button } from "./ui/button"

export default function SignOut(){
    const router = useRouter()
    return (
        <Button
            variant="default"
            onClick={() => {
                authClient.signOut({
                    fetchOptions: {
                        onSuccess: () => {
                            router.push("/sign-in")
                        }
                    }
                })
            }}
        >
            Sign Out
        </Button>
    )
}