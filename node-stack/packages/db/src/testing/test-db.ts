import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import * as schema from '../schema/index.js';
import * as path from 'path';

export interface TestDb {
  db: NodePgDatabase<typeof schema>;
  pool: Pool;
  container: StartedPostgreSqlContainer;
  cleanup: () => Promise<void>;
}

export async function createTestDb(): Promise<TestDb> {
  // Start PostgreSQL container (pulled once, cached by Docker)
  const container = await new PostgreSqlContainer('postgres:15-alpine')
    .withDatabase('test_db')
    .withUsername('test_user')
    .withPassword('test_pass')
    .start();

  const pool = new Pool({
    connectionString: container.getConnectionUri(),
  });

  const db = drizzle(pool, { schema });

  // Run all migrations against this fresh DB
  await migrate(db, {
    migrationsFolder: path.resolve(__dirname, '../../migrations'),
  });

  const cleanup = async (): Promise<void> => {
    await pool.end();
    await container.stop();
  };

  return { db, pool, container, cleanup };
}

// Truncate all tables between tests (faster than recreating DB)
export async function truncateAll(
  db: NodePgDatabase<typeof schema>
): Promise<void> {
  await db.execute(
    sql`TRUNCATE TABLE users, workspaces, memberships, sessions, workspace_invitations, subscriptions, outbox, audit_logs, oauth_accounts RESTART IDENTITY CASCADE`
  );
}
