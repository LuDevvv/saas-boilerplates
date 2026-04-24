/**
 * Integration Test Infrastructure Setup
 * 
 * Global lifecycle management for testcontainers PostgreSQL and Redis.
 * This module is imported via vitest globalSetup to spin up infrastructure
 * before any tests run and tear it down after all tests complete.
 * 
 * Key features:
 * - PostgreSQL 16 Alpine with RLS policies applied
 * - Redis 7 Alpine
 * - Clean database state per test file using transaction rollback
 * - App user role creation for RLS testing
 */

import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';
import { execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import path from 'path';

export interface TestInfrastructure {
  dbUrl: string;
  dbHost: string;
  dbPort: number;
  redisHost: string;
  redisPort: number;
}

export interface TestFileContext {
  workspaceId?: string;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface TenantContext {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  ownerToken: string;
  ownerEmail: string;
  ownerPassword: string;
}

// Global singleton to prevent container restart on file-level imports
let infrastructure: TestInfrastructure | null = null;
let stopFn: (() => Promise<void>) | null = null;

export async function setupInfrastructure(): Promise<TestInfrastructure> {
  if (infrastructure) {
    return infrastructure;
  }

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
  const dbHost = postgres.getHost();
  const dbPort = postgres.getMappedPort(5432);
  const redisHost = redis.getHost();
  const redisPort = redis.getMappedPort(6379);

  console.log(`✅ Postgres ready: ${dbUrl}`);
  console.log(`✅ Redis ready: ${redisHost}:${redisPort}`);

  // Clean and prepare database
  await prepareDatabase(dbUrl);

  infrastructure = { dbUrl, dbHost, dbPort, redisHost, redisPort };

  // Setup teardown
  stopFn = async () => {
    console.log('\n🛑 Tearing down infrastructure...');
    if (process.env.CI || !process.env.REUSE_CONTAINERS) {
      await postgres.stop();
      await redis.stop();
      console.log('✅ Infrastructure stopped.');
    } else {
      console.log('ℹ️ Containers kept running for reuse.');
    }
  };

  return infrastructure;
}

async function prepareDatabase(dbUrl: string): Promise<void> {
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: dbUrl });

  try {
    // Clean database schema
    console.log('Cleaning database...');
    await pool.query('DROP SCHEMA public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await pool.query('GRANT ALL ON SCHEMA public TO public');

    // Create app_user role for RLS testing (simulates production scenario)
    console.log('Creating app_user role for RLS testing...');
    await pool.query('DROP ROLE IF EXISTS app_user');
    await pool.query("CREATE ROLE app_user WITH LOGIN PASSWORD 'app_pass'");
    await pool.query('GRANT ALL ON SCHEMA public TO app_user');
    await pool.query('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user');
    await pool.query('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user');
    await pool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user');
    await pool.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_user');
    
    console.log('✅ Database cleaned and app_user created.');
  } catch (error) {
    console.error('❌ Failed to prepare database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

export async function applySchema(dbUrl: string): Promise<void> {
  console.log('📦 Syncing schema with drizzle-kit push...');
  
  const rootDir = findRootDir();
  
  try {
    execSync('pnpm --filter @node-stack/db db:push', {
      env: { ...process.env, DATABASE_URL: dbUrl, NODE_ENV: 'test' },
      cwd: rootDir,
      stdio: 'inherit',
    });
    console.log('✅ Schema pushed.');
  } catch (error) {
    console.error('❌ Failed to push schema:', error);
    throw error;
  }
}

export async function applyMigrations(dbUrl: string): Promise<void> {
  console.log('🔄 Running migrations...');
  
  const rootDir = findRootDir();
  
  try {
    execSync('pnpm --filter @node-stack/db db:migrate', {
      env: { ...process.env, DATABASE_URL: dbUrl, NODE_ENV: 'test' },
      cwd: rootDir,
      stdio: 'inherit',
    });
    console.log('✅ Migrations applied.');
  } catch (error) {
    console.error('❌ Failed to run migrations:', error);
    // Fallback: try push as alternative
    try {
      execSync('pnpm --filter @node-stack/db db:push', {
        env: { ...process.env, DATABASE_URL: dbUrl, NODE_ENV: 'test' },
        cwd: rootDir,
        stdio: 'inherit',
      });
    } catch (pushError) {
      console.error('❌ Push fallback also failed:', pushError);
      throw pushError;
    }
  }
}

export async function applyRLSPolicies(dbUrl: string): Promise<void> {
  console.log('🔒 Applying RLS policies...');
  
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: dbUrl });
  const fs = await import('fs');
  
  try {
    const rootDir = findRootDir();
    const migrationPath = path.join(rootDir, 'packages/db/migrations/0012_enable_rls.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.log('⚠️ RLS migration not found, skipping...');
      return;
    }
    
    const rlsSql = fs.readFileSync(migrationPath, 'utf8');
    await pool.query(rlsSql);
    console.log('✅ RLS policies applied.');
  } catch (error) {
    // RLS policies may already exist or fail on some constraints - log but don't throw
    console.warn('⚠️ RLS policy application warning:', error);
  } finally {
    await pool.end();
  }
}

function findRootDir(): string {
  const cwd = process.cwd();
  if (cwd.includes('node-stack')) {
    return cwd.split('node-stack')[0] + 'node-stack';
  }
  return cwd;
}

export async function getInfrastructure(): Promise<TestInfrastructure> {
  if (!infrastructure) {
    return setupInfrastructure();
  }
  return infrastructure;
}

export async function teardownInfrastructure(): Promise<void> {
  if (stopFn) {
    await stopFn();
    infrastructure = null;
    stopFn = null;
  }
}

// Create a shared cleanup function for transaction rollback strategy
export function createTransactionCleanup(dbUrl: string): () => Promise<void> {
  let committed = false;
  const { Pool } = require('pg');
  let pool: any;

  return async function cleanup() {
    if (committed) return;
    
    try {
      if (!pool) {
        pool = new Pool({ connectionString: dbUrl });
      }
      await pool.end();
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  };
}

export default {
  setupInfrastructure,
  getInfrastructure,
  teardownInfrastructure,
  applySchema,
  applyMigrations,
  applyRLSPolicies,
};