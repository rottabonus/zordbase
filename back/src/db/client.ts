import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.ts";

const pool = new Pool({
	connectionString:
		process.env.DATABASE_URL ||
		"postgresql://postgres:postgres@localhost:5432/zordbase",
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

export const closePool = () => pool.end();

// For graceful shutdown
process.on("SIGINT", async () => {
	console.log("Closing database pool...");
	await closePool();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("Closing database pool...");
	await closePool();
	process.exit(0);
});
