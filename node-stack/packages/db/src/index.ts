import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema/index.js";
import { RequestContextService } from "./context/request-context.service.js";

export { schema };
export type Database = NodePgDatabase<typeof schema>;
export const Database = {} as any; // Dummy value for NestJS metadata

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Sentinel value the system bypass policy whitelists. Any workspaceId
// equal to this string would collide with the bypass; UUID_REGEX above
// prevents tenant code from setting it.
const SYSTEM_GUC_VALUE = "system";

/**
 * Open a transaction with the per-tenant RLS GUC set to `workspaceId`.
 * RLS policies on the protected tables compare
 * `current_setting('app.current_workspace_id')` against the row's
 * workspace_id, so all reads and writes inside this transaction are
 * automatically scoped to that workspace. Any code path that touches
 * an RLS-protected table from a request context MUST use this wrapper
 * (or withSystemTx for cron/admin work).
 */
export async function withTenantTx<T>(
  workspaceId: string,
  callback: (tx: Database) => Promise<T>,
  db: Database,
): Promise<T> {
  if (!db) {
    throw new Error("withTenantTx: db is required");
  }
  if (!UUID_REGEX.test(workspaceId)) {
    throw new Error("withTenantTx: workspaceId must be a valid UUID");
  }
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT set_config('app.current_workspace_id', ${workspaceId}, true)`,
    );
    return callback(tx);
  });
}

/**
 * Open a transaction with the RLS GUC set to the literal `system`
 * sentinel. The companion policy added in migration 0016 whitelists
 * this value, allowing crons, admin tooling, and other cross-tenant
 * jobs to read across workspaces. Use sparingly and audit each call
 * site — anything in a user request path should use withTenantTx.
 */
export async function withSystemTx<T>(
  callback: (tx: Database) => Promise<T>,
  db: Database,
): Promise<T> {
  if (!db) {
    throw new Error("withSystemTx: db is required");
  }
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT set_config('app.current_workspace_id', ${SYSTEM_GUC_VALUE}, true)`,
    );
    return callback(tx);
  });
}

/**
 * @deprecated Prefer withTenantTx (request paths) or withSystemTx
 * (crons/admin). This shim still reads workspaceId from
 * RequestContextService for legacy callers; if no workspace is in
 * scope the transaction runs without setting the GUC and any
 * RLS-protected query inside fails closed (returns 0 rows).
 */
export async function withTransaction<T>(
  callback: (tx: Database) => Promise<T>,
  dbOrTx: Database,
): Promise<T> {
  if (!dbOrTx) {
    throw new Error("withTransaction: dbOrTx is required");
  }
  return dbOrTx.transaction(async (tx) => {
    const context = new RequestContextService();
    const workspaceId = context.workspaceId;
    if (workspaceId && UUID_REGEX.test(workspaceId)) {
      await tx.execute(
        sql`SELECT set_config('app.current_workspace_id', ${workspaceId}, true)`,
      );
    }
    return callback(tx);
  });
}

export * from "./schema/index.js";
export * from "./repositories/index.js";
export * from "./database.module.js";
export * from "./tokens.js";
export * from "./utils/api-key.utils.js";
export * from "drizzle-orm";
export { RequestContextService } from "./context/request-context.service.js";
export * from "./context/request-context.service.js";

// Alias for backward compatibility
export { DatabaseModule as DbModule } from "./database.module.js";

// Export a dummy db instance to satisfy legacy global imports if necessary.
// In a real NestJS app, this should be avoided in favor of DI.
export const db = {} as Database;
