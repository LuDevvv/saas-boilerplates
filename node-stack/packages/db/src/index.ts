import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';

export * from './schema/index.js';
import {
  eq,
  and,
  or,
  ne,
  gt,
  gte,
  lt,
  lte,
  like,
  ilike,
  inArray,
  isNull,
  isNotNull,
  sql,
  desc,
  asc,
} from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: connectionString,
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  allowExitOnIdle: true,
  ssl: false,
});

// Pool stats for health monitoring
export function getPoolStats() {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
}

// Graceful pool end helper (for graceful shutdown)
export async function endPool(): Promise<void> {
  await pool.end();
}

// Development-time SQL query logger
const isDev = process.env.NODE_ENV === 'development';

export const db = drizzle(pool, {
  schema,
  logger: isDev,
});

export * from './constants.js';
export type Database = typeof db;

// Repositories barrel export
export * from './repositories/index.js';
export * from './repositories/api-key.repository.js';
export * from './utils/api-key.utils.js';
export { hashKey, getKeyPreview, generateApiKey, extractPrefix, verifyApiKey } from './utils/api-key.utils.js';
export { WorkspaceRepository } from './repositories/workspace.repository.js';
export { UserRepository } from './repositories/user.repository.js';
export { InvitationRepository } from './repositories/invitation.repository.js';
export { SessionRepository } from './repositories/session.repository.js';
export { AuthRepository } from './repositories/auth.repository.js';
export { BillingRepository } from './repositories/billing.repository.js';
export { FileRepository } from './repositories/file.repository.js';
export { InboundWebhookRepository } from './repositories/inbound-webhook.repository.js';
export { AnalyticsRepository } from './repositories/analytics.repository.js';
export { AuditLogRepository } from './repositories/audit-log.repository.js';
export { SystemConfigRepository } from './repositories/system-config.repository.js';
export { PortabilityRepository } from './repositories/portability.repository.js';
export { DB_TOKEN } from './tokens.js';

export async function withTransaction<T>(
  callback: (tx: Database) => Promise<T>,
  dbInstance: Database = db,
): Promise<T> {
  return await dbInstance.transaction(async (tx) => {
    return await callback(tx as unknown as Database);
  });
}

export {
  schema,
  eq,
  and,
  or,
  ne,
  gt,
  gte,
  lt,
  lte,
  like,
  ilike,
  inArray,
  isNull,
  isNotNull,
  sql,
  desc,
  asc,
};

export const {
  users,
  sessions,
  accounts,
  verificationTokens,
  oauthAccounts,
  workspaces,
  memberships,
  workspaceInvitations,
  auditLogs,
  tasks,
  outbox,
  customers,
  subscriptions,
  billingEvents,
  files,
} = schema;

export * from './factories/index.js';
export { DatabaseModule } from './database.module.js';
export { DatabaseModule as DbModule } from './database.module.js';
