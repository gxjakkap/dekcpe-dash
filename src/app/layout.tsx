import type { Metadata } from "next"
import { Funnel_Display, Funnel_Sans, Prompt } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const prompt = Prompt({
	subsets: ["latin", "thai"],
	variable: "--font-prompt",
	display: "swap",
	weight: ["400", "500", "600", "700"],
})

const funnelDisplay = Funnel_Display({
	subsets: ["latin"],
	variable: "--font-funnel-display",
	display: "swap",
	weight: ["300", "400", "500"],
})

const funnelSans = Funnel_Sans({
	subsets: ["latin"],
	variable: "--font-funnel-sans",
	display: "swap",
	weight: ["400", "500"],
})

export const metadata: Metadata = {
	title: "dekcpe.link",
	description: "Short link for CPE KMUTT",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${prompt.variable} ${funnelDisplay.variable} ${funnelSans.variable}`} suppressHydrationWarning>
			<body className="font-sans antialiased">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<NuqsAdapter>{children}</NuqsAdapter>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	)
}
