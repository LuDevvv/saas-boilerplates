import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';
import { execSync } from 'child_process';

export async function setup() {
  console.log('\n🚀 Starting Integration Test Infrastructure...');

  // Start Postgres 16
  const postgres = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('test_db')
    .withUsername('test_user')
    .withPassword('test_pass')
    .withReuse()
    .start();

  // Start Redis 7
  const redis = await new RedisContainer('redis:7-alpine')
    .withReuse()
    .start();

  const dbUrl = postgres.getConnectionUri();
  const redisHost = redis.getHost();
  const redisPort = redis.getMappedPort(6379);

  process.env.DATABASE_URL = dbUrl;
  process.env.REDIS_HOST = redisHost;
  process.env.REDIS_PORT = redisPort.toString();

  console.log(`✅ Postgres ready: ${dbUrl}`);
  console.log(`✅ Redis ready: ${redisHost}:${redisPort}`);

  // Ensure clean slate (drop public schema and recreate)
  console.log('Cleaning database...');
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: dbUrl });
    
    // Atomically reset schema
    await pool.query('DROP SCHEMA IF EXISTS public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await pool.query('GRANT ALL ON SCHEMA public TO public');
    
    // Create non-superuser for RLS testing with robust cleanup
    console.log('Managing app_user role...');
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
          -- Aggressively clear all dependencies
          DROP OWNED BY app_user CASCADE;
          DROP ROLE app_user;
        END IF;
      END
      $$;
    `);
    
    await pool.query("CREATE ROLE app_user WITH LOGIN PASSWORD 'app_pass'");
    await pool.query('GRANT ALL ON SCHEMA public TO app_user');
    await pool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user');
    await pool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_user');
    
    await pool.end();
    console.log('✅ Database cleaned and app_user created.');
  } catch (error) {
    console.error('❌ Failed to clean database:', error);
    // Don't throw here to allow testcontainers to potentially be reused if some parts succeeded
  }

  // Sync schema using push (fast and matches current code)
  console.log('Syncing schema with drizzle-kit push...');
  const rootDir = process.cwd().includes('node-stack') 
    ? process.cwd().split('node-stack')[0] + 'node-stack'
    : process.cwd();
    
  try {
    execSync('pnpm --filter @node-stack/db db:push', {
      env: { ...process.env, DATABASE_URL: dbUrl, MIGRATION_DATABASE_URL: dbUrl, NODE_ENV: 'test' },
      cwd: rootDir,
      stdio: 'inherit'
    });
    console.log('✅ Schema pushed.');
  } catch (error) {
    console.error('❌ Failed to push schema:', error);
    throw error;
  }

  // Manually apply post-push migrations that drizzle-kit push doesn't
  // emit (RLS policy changes, soft-delete partial indexes). Phase 3
  // hand-wrote these because db:generate is TTY-blocked in CI; they
  // need to be replayed in order on top of the pushed schema.
  console.log('Applying post-push migrations...');
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: dbUrl });
    const fs = await import('fs');
    const path = await import('path');

    const migrations = [
      '0012_enable_rls.sql',
      '0016_rls_system_bypass.sql',
      '0017_enable_rls_tickets.sql',
      // 0013-0015 are pure schema and 0018's soft-delete columns are
      // covered by db:push above; only the RLS policy migrations need
      // explicit replay because push doesn't manage policies.
    ];

    for (const migration of migrations) {
      const migrationPath = path.join(rootDir, 'packages/db/migrations', migration);
      if (fs.existsSync(migrationPath)) {
        console.log(`Loading migration: ${migration}`);
        const sqlText = fs.readFileSync(migrationPath, 'utf8');
        try {
          await pool.query(sqlText);
        } catch (err: any) {
          // Idempotent re-run: policies/columns may already exist on a
          // reused container.
          if (!/already exists/i.test(err.message)) {
            throw err;
          }
          console.warn(`  ⚠️ ${migration}: ${err.message}`);
        }
      } else {
        console.warn(`⚠️ Migration file not found: ${migrationPath}`);
      }
    }
    await pool.end();
    console.log('✅ Post-push migrations applied.');
  } catch (error) {
    console.warn('⚠️ Failed to apply post-push migrations:', (error as Error).message);
  }

  return async () => {
    console.log('\n🛑 Tearing down infrastructure...');
    if (process.env.CI) {
      const { RedisContainer } = await import('@testcontainers/redis');
      const { PostgreSqlContainer } = await import('@testcontainers/postgresql');
      await postgres.stop();
      await redis.stop();
      console.log('✅ Infrastructure stopped.');
    } else {
      console.log('ℹ️ Containers kept running for reuse.');
    }
  };
}

