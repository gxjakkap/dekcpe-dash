"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

export interface QuickAnalyticsTopDevicesColumn {
  device: string,
  count: number
}

interface QuickAnalyticsTopDevicesTableProps {
  data: QuickAnalyticsTopDevicesColumn[]
}

export function QuickAnalyticsTopDevicesTable(props: QuickAnalyticsTopDevicesTableProps) {
    console.log(props.data)
    return (
        <div>
        <div className="bg-background overflow-hidden rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="h-9 py-2">Device</TableHead>
                        <TableHead className="h-9 py-2">Clicks</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {props.data.map((x, i) => (
                        <TableRow key={i}>
                            <TableCell className="py-2 font-medium">
                                {x.device}
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
