import { sql } from "drizzle-orm"
import { clicks } from "@/db/schema"

// keys are capitalized: written by the Go redirect server, see schema.ts
export const clickCountry = sql<string>`COALESCE(NULLIF(${clicks.geolocation}->>'Country', ''), 'Unknown')`
export const clickRegion = sql<string>`COALESCE(NULLIF(${clicks.geolocation}->>'Region', ''), 'Unknown')`
export const clickCity = sql<string>`COALESCE(NULLIF(${clicks.geolocation}->>'City', ''), 'Unknown')`
