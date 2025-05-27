"use client"

import { InitialStateTablePage } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "./tablecomponents"

export interface LinksColumn {
    slug: string,
    url: string,
    createdAt: Date,
    updatedAt: Date,
    clickCount: number,
}

interface LinksTableProps {
    data: LinksColumn[],
    initialState?: InitialStateTablePage
}

/* const filterKeys: Array<keyof LinksColumn> = [
    "slug",
    "url",
    "createdAt",
    "updatedAt"
] */

export function LinksTable(props: LinksTableProps) {
    const columns: (ColumnDef<LinksColumn>&{ accessorKey: string })[] = [
          {
              accessorKey: "idx",
              header: "#",
              cell: ({ row }) => {
                  return (
                      <div>{row.index + 1}</div>
                  )
              },
          },
          {
              accessorKey: "slug",
              header: "Link",
              cell: ({ row }) => (
                  <div>{(new URL(row.getValue("slug"), process.env.NEXT_PUBLIC_SHORTLINK_BASE_URL!)).toString()}</div>
              ),
          },
          {
              accessorKey: "url",
              header: "Destination",
              cell: ({ row }) => {
                  return (
                      <div>{row.getValue("url")}</div>
                  )
              },
          },
          {
              accessorKey: "clickCount",
              header: "Clicks",
              cell: ({ row }) => (
                  <div>{row.getValue("clickCount")}</div>
              ),
          }
      ]
    return (
        <DataTable
            columns={columns}
            data={props.data}
            initialState={props.initialState}
            rowClickable={true}
            hrefPrefix="link/"
            hrefColumn={columns.find((c): c is ColumnDef<LinksColumn> & { accessorKey: keyof LinksColumn } => 
                c.accessorKey === "slug"
            ) ?? undefined}
            isLoading={false}
        />
    )
}