import { requireUser } from "@/lib/session"

// proxies geoBoundaries ADM1 (province/state) polygons: its geojson sits behind a GitHub redirect that fails CORS
export async function GET(_req: Request, { params }: { params: Promise<{ iso3: string }> }) {
	await requireUser()
	const { iso3 } = await params
	if (!/^[A-Z]{3}$/.test(iso3)) return new Response(null, { status: 400 })

	const meta = await fetch(`https://www.geoboundaries.org/api/current/gbOpen/${iso3}/ADM1/`)
	if (!meta.ok) return new Response(null, { status: 404 })
	const { simplifiedGeometryGeoJSON } = await meta.json()

	const geo = await fetch(simplifiedGeometryGeoJSON)
	if (!geo.ok) return new Response(null, { status: 502 })
	return new Response(geo.body, {
		headers: { "content-type": "application/json", "cache-control": "private, max-age=604800" },
	})
}
