"use client"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { signIn } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { AnimatedGradientText } from "./magicui/animated-gradient-text"

export default function SignIn() {
  const [loading, setLoading] = useState(false)
  
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          With your KMUTT account to access <AnimatedGradientText className="font-bold">dekcpe.link</AnimatedGradientText>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className={cn(
              "w-full gap-2 flex items-center",
              "justify-between flex-col"
            )}>
              
				<Button
                  variant="outline"
                  className={cn(
                    "w-full gap-2"
                  )}
                  disabled={loading}
                  onClick={async () => {
                    await signIn.social(
                    {
                      provider: "microsoft",
                      callbackURL: "/d"
                    },
                    {
                      onRequest: (ctx) => {
                         setLoading(true);
                      },
                      onResponse: (ctx) => {
                         setLoading(false);
                      },
                     },
                    );
                  }}
                >
                  <svg
				xmlns="http://www.w3.org/2000/svg"
				width="1em"
				height="1em"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M2 3h9v9H2zm9 19H2v-9h9zM21 3v9h-9V3zm0 19h-9v-9h9z"
				></path>
			</svg>
                  Sign in with Microsoft
                </Button>
            </div>
        </div>
      </CardContent>
      
    </Card>
  );
}