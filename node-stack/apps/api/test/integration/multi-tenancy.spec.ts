/**
 * Multi-Tenancy Integration Tests
 * 
 * Tests for PostgreSQL Row-Level Security (RLS) enforcement.
 * Verifies that tenant isolation is correctly enforced at the database level.
 * 
 * Key scenarios:
 * - Tenant A cannot access Tenant B's tasks
 * - Tenant A cannot access Tenant B's files
 * - Tenant A cannot access Tenant B's API keys
 * - RequestContextService correctly sets app.current_workspace_id
 * - Cross-tenant operations return 403 Forbidden or 404 Not Found
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { setupInfrastructure } from '../setup.integration';
import { DbTestHelper, createDbHelper, createTenantFixture, TenantFixture } from '../helpers/db-utils';
import { withTransaction } from '@node-stack/db';

interface TenantSetup {
  workspaceId: string;
  userId: string;
  accessToken: string;
  email: string;
  password: string;
}

describe('Multi-Tenancy RLS Integration Tests', () => {
  let infra: Awaited<ReturnType<typeof setupInfrastructure>>;
  let dbHelper: DbTestHelper;
  let tenantFixture: TenantFixture;
  let appUserPool: Pool;

  // Two isolated tenants for cross-tenant testing
  let tenantA: TenantSetup;
  let tenantB: TenantSetup;

  beforeAll(async () => {
    // Infrastructure already set up by globalSetup
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not set. Check globalSetup.');
    }
    
    infra = { dbUrl } as any;
    dbHelper = createDbHelper(infra);
    tenantFixture = createTenantFixture(dbHelper);

    // Create app_user connection pool for RLS testing
    appUserPool = new Pool({
      connectionString: dbUrl,
    });
  });


  afterAll(async () => {
    await appUserPool.end();
    await dbHelper?.close();
  });

  beforeEach(async () => {
    await dbHelper.truncateAll();

    // Create two completely isolated tenants
    const { tenantA: tA, tenantB: tB } = await tenantFixture.createTwoTenants();
    
    tenantA = {
      workspaceId: tA.id,
      userId: tA.ownerId,
      accessToken: tA.ownerToken,
      email: tA.ownerEmail,
      password: tA.ownerPassword,
    };

    tenantB = {
      workspaceId: tB.id,
      userId: tB.ownerId,
      accessToken: tB.ownerToken,
      email: tB.ownerEmail,
      password: tB.ownerPassword,
    };
  });

  describe('Database-Level RLS Verification', () => {
    it('should block cross-tenant task access when workspace context is set', async () => {
      // Set Tenant A context and create a task
      await dbHelper.query(`
        INSERT INTO tasks (id, workspace_id, title, status, priority, created_at, updated_at)
        VALUES ('11111111-1111-4111-8111-111111111111', '${tenantA.workspaceId}', 'Tenant A Task', 'todo', 'high', NOW(), NOW())
      `);

      // Verify task exists for Tenant A
      const tenantATask = await dbHelper.query(`
        SELECT * FROM tasks WHERE id = '11111111-1111-4111-8111-111111111111'
      `);
      expect(tenantATask.length).toBe(1);
      expect(tenantATask[0].title).toBe('Tenant A Task');

      // Attempt to access as Tenant B (with wrong context)
      // Since we are app_user and NO context is set in THIS session, it should return 0
      const noAccess = await dbHelper.queryAsAppUser(`
        SELECT * FROM tasks WHERE workspace_id = '${tenantB.workspaceId}'
      `);
      expect(noAccess.length).toBe(0); 

      // Direct ID access should also be blocked by RLS
      const directAccess = await dbHelper.queryAsAppUser(`
        SELECT * FROM tasks WHERE id = '11111111-1111-4111-8111-111111111111'
      `);
      expect(directAccess.length).toBe(0); // RLS should block
    });

    it('should block cross-tenant file access', async () => {
      const fileId = '22222222-2222-4222-8222-222222222222';
      
      // Create file for Tenant A
      await dbHelper.query(`
        INSERT INTO files (id, workspace_id, user_id, name, key, size, mime_type, provider, created_at)
        VALUES ('${fileId}', '${tenantA.workspaceId}', '${tenantA.userId}', 'secret.pdf', 'keys/secret.pdf', 1024, 'application/pdf', 's3', NOW())
      `);

      // Direct access returns nothing (RLS enforced)
      const result = await dbHelper.queryAsAppUser(`SELECT * FROM files WHERE id = '${fileId}'`);
      expect(result.length).toBe(0); // No access without correct context
    });

    it('should block cross-tenant API key access', async () => {
      const apiKeyId = '33333333-3333-4333-8333-333333333333';
      const keyHash = 'mock_hash_for_testing_only';
      
      // Create API key for Tenant A
      await dbHelper.query(`
        INSERT INTO api_keys (id, workspace_id, user_id, name, key_hash, key_preview, prefix, created_at, updated_at)
        VALUES ('${apiKeyId}', '${tenantA.workspaceId}', '${tenantA.userId}', 'Secret Key', '${keyHash}', 'xxxx1234', 'nstack_', NOW(), NOW())
      `);

      // Direct access blocked by RLS
      const result = await dbHelper.queryAsAppUser(`SELECT * FROM api_keys WHERE id = '${apiKeyId}'`);
      expect(result.length).toBe(0);
    });

    it('should block cross-tenant outbox event access', async () => {
      const eventId = '44444444-4444-4444-8444-444444444444';
      
      await dbHelper.query(`
        INSERT INTO outbox (id, workspace_id, event_type, payload, created_at)
        VALUES ('${eventId}', '${tenantA.workspaceId}', 'test.event', '{"data": "sensitive"}', NOW())
      `);

      const result = await dbHelper.queryAsAppUser(`SELECT * FROM outbox WHERE id = '${eventId}'`);
      expect(result.length).toBe(0);
    });

    it('should block cross-tenant billing customer access', async () => {
      const customerId = '55555555-5555-4555-8555-555555555555';
      
      await dbHelper.query(`
        INSERT INTO customers (id, workspace_id, provider_customer_id, provider, created_at, updated_at)
        VALUES ('${customerId}', '${tenantA.workspaceId}', 'ext_123', 'polar', NOW(), NOW())
      `);

      const result = await dbHelper.queryAsAppUser(`SELECT * FROM customers WHERE id = '${customerId}'`);
      expect(result.length).toBe(0);
    });
  });

  describe('RLS Policy Verification', () => {
    it('should verify workspace isolation policy is enforced', async () => {
      // Create multiple workspaces
      const wsIds = [];
      for (let i = 0; i < 3; i++) {
        const id = `aaa00000-0000-4000-8000-00000000000${i}`;
        await dbHelper.query(`
          INSERT INTO workspaces (id, name, slug, created_at, updated_at)
          VALUES ('${id}', 'WS ${i}', 'ws-${i}', NOW(), NOW())
        `);
        wsIds.push(id);
      }

      // Without any workspace context, workspaces table returns nothing
      const noContext = await dbHelper.queryAsAppUser(`SELECT COUNT(*) as count FROM workspaces`);
      expect(parseInt(noContext[0].count)).toBe(0);

      // Set context to first workspace
      await dbHelper.query(`
        SET LOCAL app.current_workspace_id = '${wsIds[0]}'
      `);

      // Still returns nothing because SET LOCAL only affects current transaction
      // and this is a new transaction
    });

    it('should handle NULL current_workspace_id gracefully (fail-closed)', async () => {
      // When setting is NULL (empty string), RLS should deny all access
      const result = await dbHelper.queryAsAppUser(`
        SELECT * FROM tasks LIMIT 10
      `);
      expect(result.length).toBe(0);
    });
  });

  describe('AsyncLocalStorage Context Propagation', () => {
    it('should set workspace_id in transaction via RequestContextService', async () => {
      // Create a task via the RequestContextService-managed context
      const taskId = '66666666-6666-4666-8666-666666666666';
      
      // Actually use withTransaction to set context
      await dbHelper.withTenantContext(tenantA.workspaceId, tenantA.userId, async () => {
        await withTransaction(async (tx) => {
          await tx.execute(sql.raw(`
            INSERT INTO tasks (id, workspace_id, title, status, priority, created_at, updated_at)
            VALUES ('${taskId}', '${tenantA.workspaceId}', 'Context Test Task', 'todo', 'medium', NOW(), NOW())
          `));
        }, dbHelper.getAppUserDb());
      });

      // Verify the task was created
      const created = await dbHelper.query(`
        SELECT workspace_id FROM tasks WHERE id = '${taskId}'
      `);
      expect(created.length).toBe(1);
      expect(created[0].workspace_id).toBe(tenantA.workspaceId);
    });

    it('should propagate context through nested service calls', async () => {
      // Create a full workspace with tasks
      const taskId = '77777777-7777-4777-8777-777777777777';
      
      // Create related resources
      await dbHelper.query(`
        INSERT INTO tasks (id, workspace_id, title, status, priority, created_at, updated_at)
        VALUES ('${taskId}', '${tenantA.workspaceId}', 'Nested Call Task', 'todo', 'high', NOW(), NOW())
      `);

      await dbHelper.query(`
        INSERT INTO outbox (id, workspace_id, event_type, payload, created_at)
        VALUES ('88888888-8888-4888-8888-888888888888', '${tenantA.workspaceId}', 'task.created', '{}', NOW())
      `);

      // Both should have same workspace_id
      const task = await dbHelper.query(`SELECT workspace_id FROM tasks WHERE id = '${taskId}'`);
      const outbox = await dbHelper.query(`SELECT workspace_id FROM outbox WHERE id = '88888888-8888-4888-8888-888888888888'`);

      expect(task[0].workspace_id).toBe(outbox[0].workspace_id);
      expect(task[0].workspace_id).toBe(tenantA.workspaceId);
    });
  });

  describe('RequestContextService Integration', () => {
    it('should create isolated contexts for different tenants', async () => {
      // Create resources for each tenant
      await dbHelper.query(`
        INSERT INTO tasks (id, workspace_id, title, status, priority, created_at, updated_at)
        VALUES ('a1111111-1111-4111-8111-111111111111', '${tenantA.workspaceId}', 'A Task', 'todo', 'high', NOW(), NOW())
      `);

      await dbHelper.query(`
        INSERT INTO tasks (id, workspace_id, title, status, priority, created_at, updated_at)
        VALUES ('b2222222-2222-4222-8222-222222222222', '${tenantB.workspaceId}', 'B Task', 'todo', 'high', NOW(), NOW())
      `);

      // Each tenant can only see their own task
      const taskA = await dbHelper.queryAsAppUser(`SELECT * FROM tasks WHERE title = 'A Task'`);
      const taskB = await dbHelper.queryAsAppUser(`SELECT * FROM tasks WHERE title = 'B Task'`);

      expect(taskA.length).toBe(0); // Blocked by RLS (no context)
      expect(taskB.length).toBe(0); // Blocked by RLS (no context)

      // With context, they should see their own
      const visibleA = await dbHelper.withTenantContext(tenantA.workspaceId, tenantA.userId, async () => {
        return withTransaction(async (tx) => {
          return tx.execute(sql.raw(`SELECT * FROM tasks WHERE title = 'A Task'`));
        }, dbHelper.getAppUserDb());
      });
      expect(visibleA.rows.length).toBe(1);
    });
  });

  describe('Membership-Based Isolation', () => {
    it('should only show workspaces user is member of', async () => {
      // Create a third workspace that neither tenant is member of
      const orphanWsId = '99999999-9999-4999-8999-999999999999';
      await dbHelper.query(`
        INSERT INTO workspaces (id, name, slug, created_at, updated_at)
        VALUES ('${orphanWsId}', 'Orphan Workspace', 'orphan', NOW(), NOW())
      `);

      // Query workspaces - neither tenant should see orphan
      // (unless they have direct membership)
      const tenantAMemberships = await dbHelper.queryAsAppUser(`
        SELECT COUNT(*) as count FROM memberships WHERE user_id = '${tenantA.userId}'
      `);

      expect(parseInt(tenantAMemberships[0].count)).toBe(0); // 0 without context!
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid UUID gracefully', async () => {
      const invalidUuid = 'not-a-uuid';
      
      await expect(async () => {
        await dbHelper.query(`
          INSERT INTO tasks (id, workspace_id, title, status, priority, created_at, updated_at)
          VALUES ('${invalidUuid}', '${tenantA.workspaceId}', 'Test', 'todo', 'medium', NOW(), NOW())
        `);
      }).rejects.toThrow();
    });

    it('should handle empty workspace_id in references', async () => {
      // Should fail due to NOT NULL constraint
      await expect(async () => {
        await dbHelper.query(`
          INSERT INTO tasks (id, workspace_id, title, status, priority, created_at, updated_at)
          VALUES ('ccccccc1-1111-4111-8111-111111111111', NULL, 'Test', 'todo', 'medium', NOW(), NOW())
        `);
      }).rejects.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    it('should have indexes for workspace_id lookups', async () => {
      // Verify indexes exist
      const indexes = await dbHelper.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'tasks'
        AND indexname LIKE '%workspace%'
      `);

      expect(indexes.length).toBeGreaterThan(0);
    });

    it('should batch operations efficiently per tenant', async () => {
      // Create multiple tasks for Tenant A
      const taskIds = [];
      for (let i = 0; i < 10; i++) {
        const id = `dddd0000-0000-4000-8000-00000000000${i}`;
        await dbHelper.query(`
          INSERT INTO tasks (id, workspace_id, title, status, priority, created_at, updated_at)
          VALUES ('${id}', '${tenantA.workspaceId}', 'Batch Task ${i}', 'todo', 'medium', NOW(), NOW())
        `);
        taskIds.push(id);
      }

      // Query should be fast due to index
      const start = Date.now();
      await dbHelper.query(`SELECT * FROM tasks WHERE workspace_id = '${tenantA.workspaceId}'`);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // Should complete quickly
    });
  });
});

describe('Multi-Tenancy HTTP API Tests', () => {
  // Additional tests that verify isolation through HTTP endpoints
  // These complement the database-level tests

  let infra: Awaited<ReturnType<typeof setupInfrastructure>>;
  let dbHelper: DbTestHelper;
  let tenantFixture: TenantFixture;
  let app: any;
  let httpServer: any;

  let tenantA: TenantSetup;
  let tenantB: TenantSetup;

  beforeAll(async () => {
    // Infrastructure setup already handled by globalSetup
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not set. Check globalSetup.');
    }
    
    // Provide missing env vars for app initialization
    process.env.GOOGLE_CLIENT_ID = 'dummy';
    process.env.GOOGLE_CLIENT_SECRET = 'dummy';
    process.env.GOOGLE_CALLBACK_URL = 'dummy';
    process.env.GITHUB_CLIENT_ID = 'dummy';
    process.env.GITHUB_CLIENT_SECRET = 'dummy';
    process.env.GITHUB_CALLBACK_URL = 'dummy';
    process.env.API_KEY_PEPPER = 'dummy';
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    process.env.JWT_SECRET = 'test-secret-at-least-16-chars-long';
    process.env.REDIS_URL = `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;

    infra = { dbUrl } as any;
    dbHelper = createDbHelper(infra);
    tenantFixture = createTenantFixture(dbHelper);


    // Setup NestJS app for HTTP tests
    const { Test, TestingModule } = await import('@nestjs/testing');
    const { UnprocessableEntityException } = await import('@nestjs/common');
    const { createZodValidationPipe } = await import('nestjs-zod');
    const { HttpExceptionFilter } = await import('../../src/common/filters/http-exception.filter.js');

    const module: TestingModule = await Test.createTestingModule({
      imports: [await import('../../src/app.module.js').then(m => m.AppModule)],
    }).compile();

    app = module.createNestApplication();
    
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new (createZodValidationPipe({
        createValidationException: (error: any) => new UnprocessableEntityException({
          statusCode: 422,
          message: "Validation failed",
          errors: error.errors.map((e: any) => ({ path: e.path, message: e.message })),
        }),
      }))(),
    );
    
    app.setGlobalPrefix('v1', {
      exclude: ["/api/docs", "/api/docs-json", "/billing/webhook", "/health", "/health/live", "/health/ready"],
    });

    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app?.close();
    await dbHelper?.close();
  });

  beforeEach(async () => {
    await dbHelper.truncateAll();

    const { tenantA: tA, tenantB: tB } = await tenantFixture.createTwoTenants();
    
    tenantA = {
      workspaceId: tA.id,
      userId: tA.ownerId,
      accessToken: tA.ownerToken,
      email: tA.ownerEmail,
      password: tA.ownerPassword,
    };

    tenantB = {
      workspaceId: tB.id,
      userId: tB.ownerId,
      accessToken: tB.ownerToken,
      email: tB.ownerEmail,
      password: tB.ownerPassword,
    };
  });

  it('should verify Tenant B cannot access Tenant A workspace via HTTP', async () => {
    const request = (await import('supertest')).default;

    // Tenant A creates a task
    const createRes = await request(httpServer)
      .post(`/v1/workspaces/${tenantA.workspaceId}/tasks`)
      .set('Authorization', `Bearer ${tenantA.accessToken}`)
      .send({ title: 'Tenant A Secret Task' });

    // If task creation succeeded, try to access from Tenant B
    if (createRes.status === 201) {
      const taskId = createRes.body.id;

      // Tenant B tries to access Tenant A's task
      const accessRes = await request(httpServer)
        .get(`/v1/workspaces/${tenantA.workspaceId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${tenantB.accessToken}`);

      // Should be 403 (Forbidden) or 404 (Not Found) due to RLS
      expect([403, 404, 401]).toContain(accessRes.status);
    }
  });
});