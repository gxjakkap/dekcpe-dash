import "dotenv/config"

import { defineConfig } from "drizzle-kit"
import { databaseUrl } from "./src/db/url"

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: databaseUrl(process.env.DRIZZLE_MIGRATION === "1" ? "localhost" : undefined),
	},
})
