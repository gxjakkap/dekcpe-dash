import type { Metadata } from "next"
import { Prompt } from "next/font/google"
import localFont from "next/font/local"
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

// Funnel is self-hosted: next/font/google failed to fetch it in the Docker build. Variable, latin only
const funnelDisplay = localFont({
	src: "./fonts/funnel-display.woff2",
	variable: "--font-funnel-display",
	display: "swap",
	weight: "300 800",
})

const funnelSans = localFont({
	src: "./fonts/funnel-sans.woff2",
	variable: "--font-funnel-sans",
	display: "swap",
	weight: "300 800",
})

export const metadata: Metadata = {
	title: "dekcpe.link",
	description: "Short link for CPE KMUTT",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang="en"
			className={`${prompt.variable} ${funnelDisplay.variable} ${funnelSans.variable}`}
			suppressHydrationWarning>
			<body className="font-sans antialiased">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<NuqsAdapter>{children}</NuqsAdapter>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	)
}
