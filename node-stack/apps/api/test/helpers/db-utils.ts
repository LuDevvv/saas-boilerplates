/**
 * Database Utilities for Integration Tests
 * 
 * Provides helpers for:
 * - Running migrations against test database
 * - Truncating tables for clean state between tests
 * - Transaction management for test isolation
 * - Request context setup with AsyncLocalStorage
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolClient } from 'pg';
import * as schema from '@node-stack/db/schema';
import { RequestContextService } from '@node-stack/db';
import type { TestInfrastructure } from '../setup.integration';

// Re-export for convenience
export { TenantContext, TestFileContext } from '../setup.integration';

// Schema tables that need truncation (in dependency order for foreign keys)
const TRUNCATE_ORDER = [
  'outbox',
  'audit_logs',
  'files',
  'tasks',
  'api_keys',
  'subscriptions',
  'customers',
  'billing_events',
  'inbound_webhook_logs',
  'notifications',
  'ai_logs',
  'portability_requests',
  'system_config',
  'workspace_invitations',
  'memberships',
  'oauth_accounts',
  'accounts',
  'sessions',
  'verification_tokens',
  'users',
  'workspaces',
] as const;

export type TruncatableTable = typeof TRUNCATE_ORDER[number];

/**
 * Database helper class for integration tests
 */
export class DbTestHelper {
  private pool: Pool;
  private appUserPool: Pool;
  private drizzleDb: ReturnType<typeof drizzle>;
  private appUserDb: ReturnType<typeof drizzle>;
  private requestContext: RequestContextService;

  constructor(dbUrl: string) {
    this.pool = new Pool({ connectionString: dbUrl });
    this.drizzleDb = drizzle(this.pool, { schema });

    // Connection for RLS testing as non-owner
    const appUserUrl = dbUrl.replace(/\/\/[^@]+@/, '//app_user:app_pass@');
    this.appUserPool = new Pool({ connectionString: appUserUrl });
    this.appUserDb = drizzle(this.appUserPool, { schema });

    this.requestContext = new RequestContextService();
  }

  /**
   * Get the raw pg Pool for direct queries
   */
  getPool(): Pool {
    return this.pool;
  }

  /**
   * Get Drizzle DB instance
   */
  getDb() {
    return this.drizzleDb;
  }

  /**
   * Get RequestContextService for AsyncLocalStorage management
   */
  getContext(): RequestContextService {
    return this.requestContext;
  }

  /**
   * Run a callback within a tenant context
   */
  withTenantContext<T>(workspaceId: string, userId: string, callback: () => T): T {
    return this.requestContext.run({ workspaceId, userId }, callback);
  }

  /**
   * Execute a function within a transaction with automatic rollback
   * Used for test isolation - changes are rolled back after test completes
   */
  async withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('ROLLBACK');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute a function within a committed transaction
   * Useful for tests that need persistent data across assertions
   */
  async withCommittedTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } finally {
      client.release();
    }
  }

  /**
   * Truncate all tables in correct order (handles foreign keys)
   */
  async truncateAll(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Disable foreign key checks temporarily
      await client.query('SET CONSTRAINTS ALL DEFERRED');
      
      for (const table of TRUNCATE_ORDER) {
        // Use CASCADE for tables with dependent views
        await client.query(`TRUNCATE TABLE "${table}" CASCADE`);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Truncate specific tables
   */
  async truncateTables(tables: TruncatableTable[]): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      await client.query('SET CONSTRAINTS ALL DEFERRED');
      
      for (const table of tables) {
        await client.query(`TRUNCATE TABLE "${table}" CASCADE`);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Seed test data using direct SQL for speed
   */
  async seed(queries: string[]): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const query of queries) {
        await client.query(query);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Verify RLS is enforced by attempting cross-tenant access
   * Returns true if access was correctly denied (RLS working)
   */
  async verifyRLSEnforcement(
    table: string,
    tenantWorkspaceId: string,
    resourceId: string,
    appUserConnection = true
  ): Promise<boolean> {
    const client = await this.pool.connect();
    
    try {
      // Use app_user role which has RLS enforced
      if (appUserConnection) {
        // Reconnect as app_user
        const appUserPool = new Pool({ 
          connectionString: this.pool['connectionString'] + '?user=app_user&password=app_pass' 
        });
        const appUserClient = await appUserPool.connect();
        
        try {
          // Set workspace context for Tenant A
          await appUserClient.query(`SET app.current_workspace_id = '${tenantWorkspaceId}'`);
          
          // Try to read from Tenant B's context
          await appUserClient.query(`SET app.current_workspace_id = '00000000-0000-0000-0000-000000000001'`);
          
          // Attempt access
          const result = await appUserClient.query(
            `SELECT * FROM "${table}" WHERE id = $1`,
            [resourceId]
          );
          
          return result.rows.length === 0;
        } finally {
          appUserClient.release();
          await appUserPool.end();
        }
      }
      
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * Get Drizzle DB instance connected as app_user
   */
  getAppUserDb() {
    return this.appUserDb;
  }

  /**
   * Execute raw SQL as app_user (RLS enforced)
   */
  async queryAsAppUser<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const result = await this.appUserPool.query(sql, params);
    return result.rows as T[];
  }

  /**
   * Execute raw SQL for custom test scenarios
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(sql, params);
    return result.rows as T[];
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    await this.pool.end();
    await this.appUserPool.end();
  }
}

/**
 * Create a DbTestHelper instance from infrastructure config
 */
export function createDbHelper(infrastructure: TestInfrastructure): DbTestHelper {
  return new DbTestHelper(infrastructure.dbUrl);
}

/**
 * Fixture factory for creating test tenants
 */
export class TenantFixture {
  private dbHelper: DbTestHelper;

  constructor(dbHelper: DbTestHelper) {
    this.dbHelper = dbHelper;
  }

  /**
   * Create two isolated tenants for RLS testing
   */
  async createTwoTenants(): Promise<{ tenantA: TenantContext; tenantB: TenantContext }> {
    const now = Date.now();
    const tenantA = await this.createTenant({
      name: `Tenant A (${now})`,
      slug: `tenant-a-${now}`,
      ownerEmail: `tenant-a-${now}@test.com`,
    });

    const tenantB = await this.createTenant({
      name: `Tenant B (${now})`,
      slug: `tenant-b-${now}`,
      ownerEmail: `tenant-b-${now}@test.com`,
    });

    return { tenantA, tenantB };
  }

  /**
   * Create a single tenant with owner
   */
  async createTenant(opts: {
    name: string;
    slug: string;
    ownerEmail: string;
    ownerName?: string;
  }): Promise<TenantContext> {
    const { name, slug, ownerEmail, ownerName = 'Test Owner' } = opts;
    const passwordHash = '$2b$10$test'; // Mock hash for test purposes
    const ownerId = this.generateUuid();
    const workspaceId = this.generateUuid();

    await this.dbHelper.query(`
      INSERT INTO users (id, email, password_hash, name, email_verified, created_at, updated_at)
      VALUES ('${ownerId}', '${ownerEmail}', '${passwordHash}', '${ownerName}', true, NOW(), NOW())
    `);

    await this.dbHelper.query(`
      INSERT INTO workspaces (id, name, slug, tier, created_at, updated_at)
      VALUES ('${workspaceId}', '${name}', '${slug}', 'free', NOW(), NOW())
    `);

    await this.dbHelper.query(`
      INSERT INTO memberships (user_id, workspace_id, role, status, created_at)
      VALUES ('${ownerId}', '${workspaceId}', 'owner', 'active', NOW())
    `);

    // Create a mock token for the owner
    const token = this.generateMockToken(ownerId, workspaceId);

    return {
      id: workspaceId,
      name,
      slug,
      ownerId,
      ownerToken: token,
      ownerEmail,
      ownerPassword: 'Password123!',
    };
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private generateMockToken(userId: string, workspaceId: string): string {
    // Simple mock JWT-like token for testing
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ 
      sub: userId, 
      wid: workspaceId, 
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    })).toString('base64url');
    const signature = 'mock-signature';
    return `${header}.${payload}.${signature}`;
  }
}

/**
 * Create tenant fixture factory
 */
export function createTenantFixture(dbHelper: DbTestHelper): TenantFixture {
  return new TenantFixture(dbHelper);
}

// Export default factory
export default {
  DbTestHelper,
  createDbHelper,
  createTenantFixture,
  TRUNCATE_ORDER,
};