import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema/index.js";
import { RequestContextService } from "./context/request-context.service.js";

export { schema };
export type Database = NodePgDatabase<typeof schema>;

/**
 * Executes a function within a transaction with automatic RLS context.
 * Sets 'app.current_workspace_id' if a workspaceId is present in the current request context.
 */
export async function withTransaction<T>(
  callback: (tx: Database) => Promise<T>,
  dbOrTx: Database
): Promise<T> {
  if (!dbOrTx) {
    throw new Error("withTransaction: dbOrTx is required");
  }

  return dbOrTx.transaction(async (tx) => {
    const context = new RequestContextService();
    const workspaceId = context.workspaceId;

    if (workspaceId) {
      // Set RLS context for the duration of this transaction
      // We use a regex to ensure the workspaceId is a valid UUID to prevent SQL injection
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(workspaceId)) {
        // use set_config(name, value, is_local) which is safer and more reliable
        await tx.execute(sql.raw(`SELECT set_config('app.current_workspace_id', '${workspaceId}', true)`));
      }
    }

    return callback(tx);
  });
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
