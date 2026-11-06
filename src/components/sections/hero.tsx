"use client"

import { useEffect, useRef } from "react"
import Github from "@/components/logos/github"
import { RefractLight, tokenRgb } from "@/components/refract-light"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeroButtonProps {
	href: string
	text: string
	variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
	icon?: React.ReactNode
}

interface HeroData {
	title: string
	description: string
	note: string
	buttons: HeroButtonProps[]
}

interface HeroProps {
	className?: string
}

const siteConfig = {
	getStartedUrl: new URL("/d", "https://dash.dekcpe.link/").toString(),
	links: {
		github: "https://github.com/gxjakkap/dekcpe.link",
	},
}

const HERO_DATA: HeroData = {
	title: "Short links have never been easier",
	description: "From link shortening to QR code generation, we got you covered.",
	note: "Exclusive to CPE Students and Staff!",
	buttons: [
		{
			href: siteConfig.getStartedUrl,
			text: "Get Started",
			variant: "default",
		},
		{
			href: siteConfig.links.github,
			text: "GitHub",
			variant: "outline",
			icon: <Github className="size-5" />,
		},
	],
}

const SAMPLE = {
	host: "dekcpe.link/",
	slug: "nevergonna",
	dest: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
}

function SampleQr() {
	const ref = useRef<HTMLDivElement>(null)
	useEffect(() => {
		let gone = false
		import("qr-code-styling").then(({ default: QRCodeStyling }) => {
			if (gone || !ref.current) return
			const ink = `rgb(${tokenRgb("--color-ink")
				.map((c) => Math.round(c * 255))
				.join(" ")})`
			ref.current.replaceChildren()
			new QRCodeStyling({
				type: "svg",
				width: 152,
				height: 152,
				margin: 0,
				data: `https://${SAMPLE.host}${SAMPLE.slug}`,
				dotsOptions: { type: "rounded", color: ink },
				cornersSquareOptions: { type: "extra-rounded", color: ink },
				backgroundOptions: { color: "transparent" },
			}).append(ref.current)
		})
		return () => {
			gone = true
		}
	}, [])
	return <div ref={ref} className="size-[152px]" />
}

function ShortLinkSample() {
	return (
		<div
			role="img"
			aria-label={`Example short link ${SAMPLE.host}${SAMPLE.slug} with its QR code`}
			className="w-full max-w-[36rem] rounded-card bg-light/85 p-6 text-ink shadow-[var(--edge-light),var(--shadow-cast)] md:p-8">
			<p className="font-display text-title tracking-[var(--tracking-display)]">New short link</p>
			<div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6">
				<div className="flex min-w-0 flex-col gap-4">
					<div className="flex flex-col gap-2">
						<span className="text-sm font-medium text-muted-foreground">Destination URL</span>
						<span className="truncate rounded-inner border bg-light px-3 py-2.5 text-sm">{SAMPLE.dest}</span>
					</div>
					<div className="flex flex-col gap-2">
						<span className="text-sm font-medium text-muted-foreground">Slug</span>
						<span className="truncate rounded-inner border bg-light px-3 py-2.5 text-sm">
							<span className="text-muted-foreground">{SAMPLE.host}</span>
							{SAMPLE.slug}
						</span>
					</div>
				</div>
				<div className="hidden rounded-inner bg-light p-3 sm:block">
					<SampleQr />
				</div>
			</div>
			<div className="mt-6 flex gap-3 border-t pt-6">
				<span className="inline-flex h-9 items-center rounded-full border bg-light px-4 text-sm font-medium">
					Copy link
				</span>
				<span className="inline-flex h-9 items-center rounded-full border bg-light px-4 text-sm font-medium">
					Download QR
				</span>
			</div>
		</div>
	)
}

export default function Hero({ className }: HeroProps) {
	const { title, description, note, buttons } = HERO_DATA
	return (
		<section className={cn("w-full", className)}>
			<div className="max-w-container mx-auto flex w-full flex-col gap-10 px-4 pb-16 md:min-h-[calc(100dvh-4.5rem)] md:px-16">
				<RefractLight className="flex min-h-[24rem] flex-1 items-center justify-center rounded-card p-4 pb-20 md:justify-end md:p-10 md:pr-[8%]">
					<ShortLinkSample />
				</RefractLight>
				<div className="grid gap-8 md:grid-cols-12 md:items-end md:gap-8">
					<h1 className="text-display leading-[1.02] md:col-span-7">{title}</h1>
					<div className="flex flex-col gap-6 md:col-span-5">
						<p className="text-lead text-muted-foreground">{description}</p>
						<div className="flex flex-wrap gap-3">
							{buttons.map((button) => (
								<Button key={button.href} variant={button.variant || "default"} size="lg" asChild>
									<a href={button.href}>
										{button.icon}
										{button.text}
									</a>
								</Button>
							))}
						</div>
						<p className="text-sm text-muted-foreground">{note}</p>
					</div>
				</div>
			</div>
		</section>
	)
}
