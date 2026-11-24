"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type GroupOption = { id: number; name: string }

export function GroupSelect({
	groups,
	value,
	onChange,
}: {
	groups: GroupOption[]
	value: number
	onChange: (id: number) => void
}) {
	return (
		<Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
			<SelectTrigger className="w-full">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{groups.map((g) => (
					<SelectItem key={g.id} value={String(g.id)}>
						{g.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
