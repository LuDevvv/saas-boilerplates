import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export * from './schema';
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

export * from './constants';
export type Database = typeof db;

// Repositories barrel export
export * from './repositories';
export * from './repositories/api-key.repository';
export * from './utils/api-key.utils';
export { hashKey, getKeyPreview, generateApiKey, extractPrefix, verifyApiKey } from './utils/api-key.utils';
export { WorkspaceRepository } from './repositories/workspace.repository';
export { UserRepository } from './repositories/user.repository';
export { InvitationRepository } from './repositories/invitation.repository';
export { SessionRepository } from './repositories/session.repository';
export { AuthRepository } from './repositories/auth.repository';
export { BillingRepository } from './repositories/billing.repository';
export { FileRepository } from './repositories/file.repository';
export { InboundWebhookRepository } from './repositories/inbound-webhook.repository';
export { AnalyticsRepository } from './repositories/analytics.repository';
export { AuditLogRepository } from './repositories/audit-log.repository';
export { SystemConfigRepository } from './repositories/system-config.repository';
export { PortabilityRepository } from './repositories/portability.repository';
export { DB_TOKEN } from './tokens';

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

export * from './factories';
export { DatabaseModule } from './database.module';
export { DatabaseModule as DbModule } from './database.module';
