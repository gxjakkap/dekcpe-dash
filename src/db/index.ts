import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"

const connectionString = `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DBNAME}`
const pool = postgres(connectionString, { max: 1 })

export const db = drizzle(pool)