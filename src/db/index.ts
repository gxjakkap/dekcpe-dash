import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { databaseUrl } from "./url"

export const db = drizzle(postgres(databaseUrl(), { max: 1 }))
