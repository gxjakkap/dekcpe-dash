import localFont from "next/font/local"
import { Metadata } from "next"

import { RedeemForm } from "@/components/invite-redeem"

export const metadata: Metadata = {
  title: "redeem invite | dekcpe.link"
}


 
export default async function InvitePage() {
    return (
        <div className="flex flex-col w-screen min-h-screen">
            <div className="relative flex h-[500px] min-h-screen w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-20 md:shadow-xl">
                <div className="flex flex-col gap-y-3 py-auto z-50">
                    <h1 className={`text-4xl text-center`}>Enter Invite Code.</h1>
                    <RedeemForm />
                </div>
            </div>
        </div>
    )
}