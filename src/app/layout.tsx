import type { Metadata } from "next"
import { Prompt } from "next/font/google"
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const prompt = Prompt({
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "dekcpe.link",
  description: "Short link for CPE KMUTT",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${prompt.variable} antialiased`}
      >
        <NuqsAdapter>
          {children}
        </NuqsAdapter>
        <Toaster />
      </body>
    </html>
  )
}
