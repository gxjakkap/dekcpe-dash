"use client"

import type React from "react"
import { memo } from "react"

interface AuroraTextProps {
	children: React.ReactNode
	className?: string
	colors?: string[]
	speed?: number
}

export const AuroraText = memo(
	({
		children,
		className = "",
		// each stop keeps >= 3:1 against both the light and dark background (large text)
		colors = ["#FF0080", "#8B5CF6", "#0070F3", "#0891B2"],
		speed = 1,
	}: AuroraTextProps) => {
		const gradientStyle = {
			backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${colors[0]})`,
			WebkitBackgroundClip: "text",
			WebkitTextFillColor: "transparent",
			animationDuration: `${10 / speed}s`,
		}

		return (
			<span className={`relative inline-block ${className}`}>
				<span className="sr-only">{children}</span>
				<span
					className="relative animate-aurora bg-[length:200%_auto] bg-clip-text text-transparent"
					style={gradientStyle}
					aria-hidden="true">
					{children}
				</span>
			</span>
		)
	}
)

AuroraText.displayName = "AuroraText"
