import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"

const connectionString = `postgres://${process.env.PG_USER ?? "postgres"}:${process.env.PG_PASSWORD ?? ""}@${process.env.PG_HOST ?? "localhost"}:${process.env.PG_PORT ?? "5432"}/${process.env.PG_DBNAME ?? "postgres"}`
const pool = postgres(connectionString, { max: 1 })

export const db = drizzle(pool)