import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function QuickAnalyticsTable({ label, rows }: { label: string; rows: { name: string; count: number }[] }) {
	return (
		<div className="bg-background overflow-hidden rounded-md border">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/50">
						<TableHead className="h-9 py-2">{label}</TableHead>
						<TableHead className="h-9 py-2 text-right">Clicks</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.length === 0 && (
						<TableRow>
							<TableCell colSpan={2} className="h-20 text-center text-muted-foreground">
								No clicks yet. Share a link to see where clicks come from.
							</TableCell>
						</TableRow>
					)}
					{rows.map((x) => (
						<TableRow key={x.name}>
							<TableCell className="py-2 font-medium">{x.name}</TableCell>
							<TableCell className="py-2 text-right tabular-nums">{x.count}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
