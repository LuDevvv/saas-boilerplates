import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/index";

/**
 * Creates a strictly typed Drizzle database client for Neon Serverless via HTTP.
 * Optimized for Cloudflare Workers (Edge runtime).
 *
 * @param connectionString - The Neon database connection string (URL)
 * @returns An initialized Drizzle client with schema definitions
 */
export function createDbClient(connectionString: string) {
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

/**
 * Type representing the Drizzle database client with schema support.
 */
export type Database = ReturnType<typeof createDbClient>;
