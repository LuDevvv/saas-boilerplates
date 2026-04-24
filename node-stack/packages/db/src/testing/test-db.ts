import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import * as schema from '../schema/index.js';

export interface TestDb {
  db: NodePgDatabase<typeof schema>;
  pool: Pool;
  cleanup: () => Promise<void>;
}

/**
 * Gets a Drizzle database instance connected to the test container.
 * Assumes DATABASE_URL is set by globalSetup.
 */
export function getTestDb(): TestDb {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Did globalSetup run?');
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  return { 
    db, 
    pool,
    cleanup: async () => {
      await pool.end();
    }
  };
}

// Aliases for compatibility with existing tests
export const createTestDb = getTestDb;

export const { db, pool } = getTestDb();

/**
 * Resets the database by truncating all tables in the public schema.
 * Extremely fast way to clean up between test suites.
 */
export async function truncateAll(
  db: NodePgDatabase<typeof schema>
): Promise<void> {
  await db.execute(sql`
    DO $$ DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'drizzle_migrations') LOOP
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
        END LOOP;
    END $$;
  `);
}

// Alias for compatibility
export const resetDatabase = truncateAll;
