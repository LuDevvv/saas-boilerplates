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

import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

/**
 * Type representing the Drizzle database client or a transaction context.
 * Used across repositories to support both direct and transactional operations.
 */
export type Database = NeonHttpDatabase<typeof schema> | any; // Using any for now to handle complex Drizzle internal generics
