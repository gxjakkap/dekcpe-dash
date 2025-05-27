import "dotenv/config";

import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${(process.env.DRIZZLE_MIGRATION === "1") ? "localhost" : process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DBNAME}`,
  },
});