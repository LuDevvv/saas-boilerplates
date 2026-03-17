import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/index";

export type { Database } from "./db";

export * from "drizzle-orm";

/**
 * Factory to create a Neon HTTP database client.
 * Optimized for Edge runtimes with no TCP overhead.
 */
export const createDbClient = (url: string) => {
  const client = neon(url);
  return drizzle(client, { schema });
};

// --- Repository Exports ---
export * from "./repositories/user.repository";
export * from "./repositories/workspace.repository";
export * from "./repositories/subscription.repository";
export * from "./repositories/usage.repository";
export * from "./repositories/permission.repository";
export * from "./repositories/audit.repository";
export * from "./repositories/token.repository";
export * from "./repositories/invitation.repository";
export * from "./repositories/tasks.repository";
export * from "./repositories/metrics.repository";
export * from "./repositories/session.repository";

// --- Schema Exports ---
export * from "./schema/index";
