"use client"

import { geoArea, geoEqualEarth, geoMercator, geoPath } from "d3-geo"
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson"
import { ChevronRight } from "lucide-react"
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react"
import { feature } from "topojson-client"
import type { GeometryCollection, Topology } from "topojson-specification"
import { Skeleton } from "@/components/ui/skeleton"
import { QuickAnalyticsTable } from "../../quick-analytics-table"

export interface ClickLocation {
	country: string
	region: string
	city: string
	count: number
	/** ISO 3166-1 numeric, matches world-atlas feature ids */
	numeric?: string
	/** ISO 3166-1 alpha-3, the geoBoundaries key */
	iso3?: string
}

type Shape = Feature<Polygon | MultiPolygon, { name?: string; shapeName?: string; shapeID?: string }>

const WIDTH = 960
const HEIGHT = 500
const STEPS = 5

// "Chon Buri Province", "Chonburi" and "Chon Buri" all become "chonburi"
const norm = (s: string) =>
	s
		.normalize("NFD")
		.toLowerCase()
		.replace(/\b(province|prefecture|state|region|governorate|oblast|county|department|district|changwat)\b/g, "")
		.replace(/[^a-z]/g, "")

// d3-geo is spherical: a ring wound the "wrong" way covers the rest of the globe, so flip those
function rewind(f: Shape): Shape {
	const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates
	for (const p of polys) {
		if (geoArea({ type: "Polygon", coordinates: p }) > 2 * Math.PI) for (const ring of p) ring.reverse()
	}
	return f
}

function sum<K>(rows: ClickLocation[], key: (x: ClickLocation) => K) {
	const m = new Map<K, number>()
	for (const x of rows) m.set(key(x), (m.get(key(x)) ?? 0) + x.count)
	return m
}

// log scale: one country usually dwarfs the rest
const step = (count: number, max: number) => (count ? Math.ceil((STEPS * Math.log1p(count)) / Math.log1p(max)) : 0)
const fill = (s: number) =>
	s ? `color-mix(in oklab, var(--brand) ${s * (100 / STEPS)}%, var(--muted))` : "var(--muted)"

export function ClickMap({ locations }: { locations: ClickLocation[] }) {
	const [world, setWorld] = useState<Shape[]>()
	const [scope, setScope] = useState<{ country?: ClickLocation; region?: string }>({})
	const [regions, setRegions] = useState<{ iso3: string; shapes: Shape[] | null }>()
	const [hover, setHover] = useState<{ name: string; count: number; x: number; y: number }>()
	const box = useRef<HTMLDivElement>(null)

	useEffect(() => {
		import("world-atlas/countries-50m.json").then((m) => {
			const topo = m.default as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>
			const fc = feature(topo, topo.objects.countries) as FeatureCollection<Polygon | MultiPolygon, { name: string }>
			setWorld(fc.features.filter((f) => f.id !== "010")) // Antarctica
		})
	}, [])

	const iso3 = scope.country?.iso3
	useEffect(() => {
		if (!iso3) return
		let live = true
		fetch(`/api/regions/${iso3}`)
			.then((r) => (r.ok ? r.json() : null))
			.catch(() => null)
			.then((fc: FeatureCollection<Polygon | MultiPolygon> | null) => {
				if (live) setRegions({ iso3, shapes: fc ? (fc.features as Shape[]).map(rewind) : null })
			})
		return () => {
			live = false
		}
	}, [iso3])

	const zoomed = !!scope.country
	const inCountry = useMemo(
		() => (scope.country ? locations.filter((x) => x.country === scope.country?.country) : locations),
		[locations, scope.country]
	)
	const inScope = scope.region ? inCountry.filter((x) => norm(x.region) === scope.region) : inCountry

	const shapes = zoomed ? (regions?.iso3 === iso3 ? regions?.shapes : undefined) : world
	const paths = useMemo(() => {
		if (!shapes?.length) return
		const projection = (zoomed ? geoMercator() : geoEqualEarth()).fitSize([WIDTH, HEIGHT], {
			type: "FeatureCollection",
			features: shapes,
		})
		const path = geoPath(projection)
		return shapes.map((f) => path(f) ?? "")
	}, [shapes, zoomed])

	const key = (f: Shape) => (zoomed ? norm(f.properties.shapeName ?? "") : String(f.id))
	const counts = zoomed ? sum(inCountry, (x) => norm(x.region)) : sum(locations, (x) => x.numeric ?? "")
	const label = (f: Shape) =>
		(zoomed ? f.properties.shapeName : locations.find((x) => x.numeric === f.id)?.country) ?? f.properties.name ?? ""
	const max = Math.max(1, ...counts.values())

	function select(f: Shape) {
		const k = key(f)
		if (!counts.get(k)) return
		if (!scope.country) setScope({ country: locations.find((x) => x.numeric === k) })
		else setScope({ ...scope, region: scope.region === k ? undefined : k })
		setHover(undefined)
	}

	function onMove(e: MouseEvent, f: Shape) {
		const r = box.current?.getBoundingClientRect()
		if (!r) return
		setHover({ name: label(f), count: counts.get(key(f)) ?? 0, x: e.clientX - r.left, y: e.clientY - r.top })
	}

	const cities = [
		...sum(inScope, (x) =>
			[x.city, scope.region ? null : scope.country ? x.region : x.country].filter(Boolean).join(", ")
		),
	]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)
		.map(([name, count]) => ({ name, count }))

	const regionName = scope.region && inCountry.find((x) => norm(x.region) === scope.region)?.region

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
			<div className="lg:col-span-2 space-y-3">
				<nav aria-label="Map scope" className="flex items-center gap-1 text-sm">
					<button
						type="button"
						onClick={() => setScope({})}
						className={scope.country ? "text-muted-foreground hover:text-foreground" : "font-medium"}>
						World
					</button>
					{scope.country && (
						<>
							<ChevronRight className="h-4 w-4 text-muted-foreground" />
							<button
								type="button"
								onClick={() => setScope({ country: scope.country })}
								className={scope.region ? "text-muted-foreground hover:text-foreground" : "font-medium"}>
								{scope.country.country}
							</button>
						</>
					)}
					{regionName && (
						<>
							<ChevronRight className="h-4 w-4 text-muted-foreground" />
							<span className="font-medium">{regionName}</span>
						</>
					)}
				</nav>

				<div ref={box} className="relative">
					{shapes === null ? (
						<div className="flex aspect-[96/50] items-center justify-center rounded-md border text-sm text-muted-foreground">
							No region map available for {scope.country?.country}
						</div>
					) : !paths ? (
						<Skeleton className="aspect-[96/50] w-full" />
					) : (
						<svg
							viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
							className="w-full h-auto"
							role="img"
							aria-label="Clicks by location">
							{shapes?.map((f, i) => {
								const k = key(f)
								const count = counts.get(k) ?? 0
								const selected = scope.region === k
								return (
									// biome-ignore lint/a11y/noStaticElementInteractions: the table beside the map carries the same data
									<path
										key={f.id ?? f.properties.shapeID ?? f.properties.name}
										d={paths[i]}
										fill={fill(step(count, max))}
										stroke={selected ? "var(--foreground)" : "var(--background)"}
										strokeWidth={selected ? 1.5 : 0.5}
										className={count ? "cursor-pointer hover:opacity-80" : undefined}
										onClick={() => select(f)}
										onMouseMove={(e) => onMove(e, f)}
										onMouseLeave={() => setHover(undefined)}
									/>
								)
							})}
						</svg>
					)}
					{hover && (
						<div
							className="pointer-events-none absolute z-10 rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-sm"
							style={{ left: hover.x + 12, top: hover.y + 12 }}>
							<div className="font-medium">{hover.name}</div>
							<div className="text-muted-foreground">
								{hover.count} {hover.count === 1 ? "click" : "clicks"}
							</div>
						</div>
					)}
				</div>

				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<span className="inline-block h-3 w-3 rounded-sm border" style={{ background: fill(0) }} />
					<span className="mr-2">No clicks</span>
					<span>Fewer</span>
					{Array.from({ length: STEPS }, (_, i) => i + 1).map((s) => (
						<span key={s} className="inline-block h-3 w-5 rounded-sm" style={{ background: fill(s) }} />
					))}
					<span>More</span>
					<span className="ml-auto">{zoomed ? "Click a region to filter cities" : "Click a country to zoom in"}</span>
				</div>
			</div>

			<QuickAnalyticsTable label="City" rows={cities} />
		</div>
	)
}
