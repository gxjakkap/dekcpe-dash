"use client"

import { flag } from "country-emoji"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

export interface QuickAnalyticsTopCountriesColumn {
	country: string
	count: number
}

interface QuickAnalyticsTopCountriesTableProps {
	data: QuickAnalyticsTopCountriesColumn[]
}

export function QuickAnalyticsTopCountriesTable(props: QuickAnalyticsTopCountriesTableProps) {
	return (
		<div>
			<div className="bg-background overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50">
							<TableHead className="h-9 py-2">Country</TableHead>
							<TableHead className="h-9 py-2">Clicks</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{props.data.length === 0 && (
							<TableRow>
								<TableCell colSpan={2} className="h-20 text-center text-muted-foreground">
									No clicks yet. Share a link to see where clicks come from.
								</TableCell>
							</TableRow>
						)}
						{props.data.map((x) => (
							<TableRow key={x.country}>
								<TableCell className="py-2 font-medium">
									{flag(x.country)} {x.country}
								</TableCell>
								<TableCell className="py-2">{x.count}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
