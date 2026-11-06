"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
	// next-themes owns the theme (and its no-flash script); the toggler only animates the swap
	const { resolvedTheme, setTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	useEffect(() => setMounted(true), [])

	const classes = cn(buttonVariants({ variant: "ghost", size: "icon" }), className)
	// the server can't know the theme: hold the space until mount so the icon never flips after hydration
	if (!mounted) return <span aria-hidden="true" className={classes} />

	return (
		<AnimatedThemeToggler
			theme={resolvedTheme === "dark" ? "dark" : "light"}
			onThemeChange={setTheme}
			className={classes}
		/>
	)
}
