import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DashboardPageProps {
	title: ReactNode
	description?: ReactNode
	action?: ReactNode
	stats?: ReactNode
	className?: string
	children: ReactNode
}

export function DashboardPage({ title, description, action, stats, className, children }: DashboardPageProps) {
	return (
		<div className={cn("container mx-auto max-w-7xl px-4 py-8", className)}>
			<div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
				{/* max-w-full: in the mobile column layout this div sizes to its content, so a long title/description would push past the screen */}
				<div className="min-w-0 max-w-full">
					<h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
					{description && <p className="text-base text-muted-foreground md:text-xl">{description}</p>}
				</div>
				{action}
			</div>
			{stats && <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">{stats}</div>}
			{children}
		</div>
	)
}

export function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) {
	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-muted p-2">
						<Icon className="h-4 w-4 text-muted-foreground" />
					</div>
					<div>
						<p className="text-sm text-muted-foreground">{label}</p>
						<p className="text-2xl font-bold">{value}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export function SectionCard({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Icon className="h-5 w-5" />
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent className="px-6">{children}</CardContent>
		</Card>
	)
}
