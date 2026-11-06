"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import Github from "@/components/logos/github"
import { RefractLight } from "@/components/refract-light"
import { Button } from "@/components/ui/button"

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
			ref.current.replaceChildren()
			// currentColor: the dots follow the wrapper's text-ink through theme changes (and Firefox drops oklch in SVG fills)
			new QRCodeStyling({
				type: "svg",
				width: 152,
				height: 152,
				margin: 0,
				data: `https://${SAMPLE.host}${SAMPLE.slug}`,
				dotsOptions: { type: "rounded", color: "currentColor" },
				cornersSquareOptions: { type: "extra-rounded", color: "currentColor" },
				backgroundOptions: { color: "transparent" },
			}).append(ref.current)
		})
		return () => {
			gone = true
		}
	}, [])
	return <div ref={ref} className="size-[152px] text-ink" />
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

export default function Hero() {
	return (
		<section className="w-full">
			<div className="max-w-container mx-auto flex w-full flex-col gap-10 px-4 pb-16 md:min-h-[calc(100dvh-4.5rem)] md:px-16">
				<RefractLight className="flex min-h-[24rem] flex-1 items-center justify-center rounded-card p-4 pb-20 md:justify-end md:p-10 md:pr-[8%]">
					<ShortLinkSample />
				</RefractLight>
				<div className="grid gap-8 md:grid-cols-12 md:items-end md:gap-8">
					<h1 className="text-display leading-[1.02] md:col-span-7">Short links have never been easier</h1>
					<div className="flex flex-col gap-6 md:col-span-5">
						<p className="text-lead text-muted-foreground">
							From link shortening to QR code generation, we got you covered.
						</p>
						<div className="flex flex-wrap gap-3">
							<Button size="lg" asChild>
								<Link href="/d">Get Started</Link>
							</Button>
							<Button variant="outline" size="lg" asChild>
								<a href="https://github.com/gxjakkap/dekcpe.link">
									<Github className="size-5" />
									GitHub
								</a>
							</Button>
						</div>
						<p className="text-sm text-muted-foreground">Exclusive to CPE Students and Staff!</p>
					</div>
				</div>
			</div>
		</section>
	)
}
