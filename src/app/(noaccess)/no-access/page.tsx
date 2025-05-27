import Link from "next/link"

import SignOut from "@/components/sign-out"
import { Button } from "@/components/ui/button"

export default async function NoAccessPage(){
    return (
        <div className="flex flex-col w-screen min-h-screen">
            <div className="relative flex h-[500px] min-h-screen w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-20 md:shadow-xl">
                <div className="flex flex-col gap-y-3 py-auto z-50">
                    <h1 className={`text-4xl text-center`}>No Access ❌</h1>
                    <SignOut />
                    <h2 className={`$text-2xl text-center`}>Have an invite code?</h2>
                    <Link href="/invite" className="mx-auto">
                        <Button className="mx-auto">
                            Redeem an invite code
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}