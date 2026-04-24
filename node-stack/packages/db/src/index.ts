import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema/index.js";

export { schema };
export type Database = NodePgDatabase<typeof schema>;

/**
 * Executes a function within a transaction.
 * @param callback The function to execute.
 * @param dbOrTx The database instance or an existing transaction to use.
 */
export async function withTransaction<T>(
  callback: (tx: Database) => Promise<T>,
  dbOrTx: Database
): Promise<T> {
  if (!dbOrTx) {
    throw new Error("withTransaction: dbOrTx is required");
  }
  return dbOrTx.transaction(callback);
}

export * from "./schema/index.js";
export * from "./repositories/index.js";
export * from "./database.module.js";
export * from "./tokens.js";
export * from "./testing/test-db.js";
export * from "./utils/api-key.utils.js";
export * from "drizzle-orm";
export { RequestContextService } from "./context/request-context.service.js";
export * from "./context/request-context.service.js";

// Alias for backward compatibility
export { DatabaseModule as DbModule } from "./database.module.js";

// Export a dummy db instance to satisfy legacy global imports if necessary.
// In a real NestJS app, this should be avoided in favor of DI.
export const db = {} as Database;
