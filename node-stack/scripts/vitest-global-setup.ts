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
      env: { ...process.env, DATABASE_URL: dbUrl, NODE_ENV: 'test' },
      cwd: rootDir,
      stdio: 'inherit'
    });
    console.log('✅ Schema pushed.');
  } catch (error) {
    console.error('❌ Failed to push schema:', error);
    throw error;
  }

  // Manually apply RLS policies from migration 0012
  console.log('Applying RLS policies...');
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: dbUrl });
    const fs = await import('fs');
    const path = await import('path');
    
    const migrationPath = path.join(rootDir, 'packages/db/migrations/0012_enable_rls.sql');
    if (fs.existsSync(migrationPath)) {
      console.log(`Loading migration from: ${migrationPath}`);
      const rlsSql = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(rlsSql);
      console.log('✅ RLS policies applied.');
    } else {
      console.warn('⚠️ RLS migration file not found at:', migrationPath);
    }
    await pool.end();
  } catch (error) {
    console.warn('⚠️ Failed to apply RLS policies (may already exist):', error.message);
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

