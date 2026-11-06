export const databaseUrl = (host = process.env.PG_HOST ?? "localhost") =>
	`postgres://${process.env.PG_USER ?? "postgres"}:${process.env.PG_PASSWORD ?? ""}@${host}:${process.env.PG_PORT ?? "5432"}/${process.env.PG_DBNAME ?? "postgres"}`
