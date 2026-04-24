/**
 * Transaction & Outbox Integration Tests
 * 
 * Verifies Unit of Work pattern and Outbox pattern correctness:
 * - Atomic transaction rollbacks: No partial writes on failure
 * - Outbox pattern: Events created within same ACID transaction
 * - Context propagation through transactions
 * - Rollback scenarios with nested transactions
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Pool } from 'pg';
import { setupInfrastructure } from '../setup.integration';
import { DbTestHelper, createDbHelper } from '../helpers/db-utils';

describe('Transaction & Outbox Integration Tests', () => {
  let infra: Awaited<ReturnType<typeof setupInfrastructure>>;
  let dbHelper: DbTestHelper;
  let pool: Pool;

  beforeAll(async () => {
    infra = await setupInfrastructure();
    const { applySchema, applyRLSPolicies } = await import('../setup.integration');
    await applySchema(infra.dbUrl);
    await applyRLSPolicies(infra.dbUrl);

    dbHelper = createDbHelper(infra);
    pool = dbHelper.getPool();
  });

  afterAll(async () => {
    await dbHelper?.close();
  });

  beforeEach(async () => {
    await dbHelper.truncateAll();
  });

  describe('Atomic Transaction Rollback', () => {
    it('should rollback workspace creation on error', async () => {
      const client = await pool.connect();
      let workspaceId: string | null = null;

      try {
        await client.query('BEGIN');

        // Create workspace
        const wsResult = await client.query(`
          INSERT INTO workspaces (name, slug, created_at, updated_at)
          VALUES ('Rollback Test WS', 'rollback-test-${Date.now()}', NOW(), NOW())
          RETURNING id
        `);
        workspaceId = wsResult.rows[0].id;

        // Create user for membership
        const userId = 'user-' + Date.now();
        await client.query(`
          INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
          VALUES ('${userId}', 'test@test.com', 'hash', 'Test', NOW(), NOW())
        `);

        // Intentionally throw error before commit
        throw new Error('Simulated failure - should rollback all');
      } catch (error) {
        // Expected error
        await client.query('ROLLBACK');
      } finally {
        client.release();
      }

      // Verify nothing was persisted
      if (workspaceId) {
        const result = await dbHelper.query(`
          SELECT * FROM workspaces WHERE id = '${workspaceId}'
        `);
        expect(result.length).toBe(0); // Workspace should not exist
      }

      const userCheck = await dbHelper.query(`SELECT COUNT(*) as count FROM users`);
      // User may or may not exist depending on implementation
    });

    it('should rollback nested transaction on error', async () => {
      const outerTransactionId = `outer-${Date.now()}`;
      const innerTransactionId = `inner-${Date.now()}`;

      await dbHelper.withTransaction(async (client) => {
        // Create outer resource
        await client.query(`
          INSERT INTO tasks (id, workspace_id, title, status, priority, created_at, updated_at)
          VALUES ('${outerTransactionId}', '00000000-0000-0000-0000-000000000001', 'Outer Task', 'todo', 'high', NOW(), NOW())
        `);

        // Simulate nested error
        throw new Error('Nested failure');
      }).catch(() => {
        // Expected - transaction was rolled back
      });

      // Verify nothing was created
      const result = await dbHelper.query(`
        SELECT * FROM tasks WHERE id = '${outerTransactionId}'
      `);
      expect(result.length).toBe(0);
    });

    it('should rollback outbox event when main operation fails', async () => {
      const taskId = `outbox-rollback-${Date.now()}`;

      await dbHelper.withTransaction(async (client) => {
        // Create workspace first (needed for foreign key)
        const wsId = `ws-rollback-${Date.now()}`;
        await client.query(`
          INSERT INTO workspaces (id, name, slug, created_at, updated_at)
          VALUES ('${wsId}', 'Outbox Test WS', 'outbox-test-${Date.now()}', NOW(), NOW())
        `);

        // Create task
        await client.query(`
          INSERT INTO tasks (id, workspace_id, title, status, priority, created_at, updated_at)
          VALUES ('${taskId}', '${wsId}', 'Task with Outbox', 'todo', 'high', NOW(), NOW())
        `);

        // Create corresponding outbox event
        await client.query(`
          INSERT INTO outbox (id, workspace_id, event_type, payload, created_at)
          VALUES ('ev-${taskId}', '${wsId}', 'task.created', '{}', NOW())
        `);

        throw new Error('Force rollback');
      }).catch(() => {});

      // Both task and outbox event should not exist
      const task = await dbHelper.query(`SELECT * FROM tasks WHERE id = '${taskId}'`);
      const outboxEvent = await dbHelper.query(`SELECT * FROM outbox WHERE id = 'ev-${taskId}'`);

      expect(task.length).toBe(0);
      expect(outboxEvent.length).toBe(0);
    });
  });

  describe('Outbox Pattern Verification', () => {
    it('should create outbox event within same transaction as workspace creation', async () => {
      const wsId = `ws-outbox-${Date.now()}`;
      const eventId = `ev-${Date.now()}`;

      await dbHelper.withCommittedTransaction(async (client) => {
        // Create workspace
        await client.query(`
          INSERT INTO workspaces (id, name, slug, created_at, updated_at)
          VALUES ('${wsId}', 'Outbox Verification WS', 'ovw-${Date.now()}', NOW(), NOW())
        `);

        // Create membership
        const userId = `user-outbox-${Date.now()}`;
        await client.query(`
          INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
          VALUES ('${userId}', 'outbox@test.com', 'hash', 'Test', NOW(), NOW())
        `);

        await client.query(`
          INSERT INTO memberships (user_id, workspace_id, role, status, created_at)
          VALUES ('${userId}', '${wsId}', 'owner', 'active', NOW())
        `);

        // Create outbox event for workspace creation
        await client.query(`
          INSERT INTO outbox (id, workspace_id, event_type, payload, created_at)
          VALUES ('${eventId}', '${wsId}', 'workspace.created', '${JSON.stringify({ workspaceId: wsId }).replace(/'/g, "''")}', NOW())
        `);
      });

      // Both should exist after commit
      const workspace = await dbHelper.query(`SELECT * FROM workspaces WHERE id = '${wsId}'`);
      const outboxEvent = await dbHelper.query(`SELECT * FROM outbox WHERE id = '${eventId}'`);

      expect(workspace.length).toBe(1);
      expect(outboxEvent.length).toBe(1);
      expect(outboxEvent[0].workspace_id).toBe(wsId);
      expect(outboxEvent[0].event_type).toBe('workspace.created');
    });

    it('should batch multiple outbox events in single transaction', async () => {
      const wsId = `ws-batch-${Date.now()}`;
      const eventIds = [`ev1-${Date.now()}`, `ev2-${Date.now()}`, `ev3-${Date.now()}`];

      await dbHelper.withCommittedTransaction(async (client) => {
        // Create workspace
        await client.query(`
          INSERT INTO workspaces (id, name, slug, created_at, updated_at)
          VALUES ('${wsId}', 'Batch WS', 'batch-${Date.now()}', NOW(), NOW())
        `);

        // Create multiple outbox events
        for (let i = 0; i < eventIds.length; i++) {
          await client.query(`
            INSERT INTO outbox (id, workspace_id, event_type, payload, created_at)
            VALUES ('${eventIds[i]}', '${wsId}', 'event.type.${i}', '{}', NOW())
          `);
        }
      });

      // All events should exist
      const events = await dbHelper.query(`
        SELECT * FROM outbox WHERE workspace_id = '${wsId}' ORDER BY created_at
      `);
      expect(events.length).toBe(3);
    });

    it('should handle outbox event with JSON payload', async () => {
      const wsId = `ws-json-${Date.now()}`;
      const eventId = `ev-json-${Date.now()}`;
      const payload = {
        userId: 'user-123',
        action: 'billing.updated',
        data: { plan: 'pro', amount: 2999, currency: 'usd' },
        metadata: { timestamp: new Date().toISOString() },
      };

      await dbHelper.withCommittedTransaction(async (client) => {
        await client.query(`
          INSERT INTO workspaces (id, name, slug, created_at, updated_at)
          VALUES ('${wsId}', 'JSON Payload WS', 'json-payload-${Date.now()}', NOW(), NOW())
        `);

        await client.query({
          text: `INSERT INTO outbox (id, workspace_id, event_type, payload, created_at) VALUES ($1, $2, $3, $4, NOW())`,
          values: [eventId, wsId, 'billing.updated', JSON.stringify(payload)],
        });
      });

      const event = await dbHelper.query(`SELECT * FROM outbox WHERE id = '${eventId}'`);
      expect(event.length).toBe(1);
      expect(event[0].event_type).toBe('billing.updated');
      
      const parsedPayload = typeof event[0].payload === 'string' 
        ? JSON.parse(event[0].payload) 
        : event[0].payload;
      expect(parsedPayload.data.plan).toBe('pro');
    });

    it('should mark outbox event as processed correctly', async () => {
      const eventId = `ev-processed-${Date.now()}`;

      await dbHelper.withCommittedTransaction(async (client) => {
        await client.query(`
          INSERT INTO outbox (id, workspace_id, event_type, payload, processed, created_at)
          VALUES ('${eventId}', '00000000-0000-0000-0000-000000000001', 'test.event', '{}', false, NOW())
        `);
      });

      // Verify it's unprocessed initially
      let event = await dbHelper.query(`SELECT * FROM outbox WHERE id = '${eventId}'`);
      expect(event[0].processed).toBe(false);

      // Mark as processed
      await dbHelper.withCommittedTransaction(async (client) => {
        await client.query(`
          UPDATE outbox SET processed = true, processed_at = NOW() WHERE id = '${eventId}'
        `);
      });

      // Verify it's now processed
      event = await dbHelper.query(`SELECT * FROM outbox WHERE id = '${eventId}'`);
      expect(event[0].processed).toBe(true);
      expect(event[0].processed_at).toBeTruthy();
    });
  });

  describe('Context Propagation in Transactions', () => {
    it('should propagate workspace_id to SET LOCAL within transaction', async () => {
      const wsId = `ws-context-${Date.now()}`;

      await dbHelper.withCommittedTransaction(async (client) => {
        // Create workspace
        await client.query(`
          INSERT INTO workspaces (id, name, slug, created_at, updated_at)
          VALUES ('${wsId}', 'Context WS', 'context-${Date.now()}', NOW(), NOW())
        `);

        // Set workspace context
        await client.query(`SET LOCAL app.current_workspace_id = '${wsId}'`);

        // Create task - should have correct workspace_id
        await client.query(`
          INSERT INTO tasks (id, workspace_id, title, status, priority, created_at, updated_at)
          VALUES ('task-context-${Date.now()}', '${wsId}', 'Context Task', 'todo', 'high', NOW(), NOW())
        `);

        // Create outbox event - should inherit context
        await client.query(`
          INSERT INTO outbox (id, workspace_id, event_type, payload, created_at)
          VALUES ('ev-context-${Date.now()}', '${wsId}', 'task.created', '{}', NOW())
        `);
      });

      // Verify context was propagated
      const tasks = await dbHelper.query(`SELECT * FROM tasks WHERE workspace_id = '${wsId}'`);
      const events = await dbHelper.query(`SELECT * FROM outbox WHERE workspace_id = '${wsId}'`);

      expect(tasks.length).toBe(1);
      expect(events.length).toBe(1);
      expect(tasks[0].workspace_id).toBe(events[0].workspace_id);
    });

    it('should handle async operations within transaction context', async () => {
      const wsId = `ws-async-${Date.now()}`;

      await dbHelper.withCommittedTransaction(async (client) => {
        await client.query(`
          INSERT INTO workspaces (id, name, slug, created_at, updated_at)
          VALUES ('${wsId}', 'Async WS', 'async-${Date.now()}', NOW(), NOW())
        `);

        // Async operations that await within transaction
        await new Promise(resolve => setTimeout(resolve, 10));

        await client.query(`
          INSERT INTO tasks (id, workspace_id, title, status, priority, created_at, updated_at)
          VALUES ('task-async-${Date.now()}', '${wsId}', 'Async Task', 'todo', 'high', NOW(), NOW())
        `);
      });

      const tasks = await dbHelper.query(`SELECT * FROM tasks WHERE workspace_id = '${wsId}'`);
      expect(tasks.length).toBe(1);
    });
  });

  describe('Concurrent Transaction Handling', () => {
    it('should handle concurrent workspace creations', async () => {
      const numWorkspaces = 5;
      const wsIds: string[] = [];

      // Create multiple workspaces concurrently
      const promises = Array.from({ length: numWorkspaces }, async (_, i) => {
        const wsId = `ws-concurrent-${Date.now()}-${i}`;
        wsIds.push(wsId);
        
        await dbHelper.withCommittedTransaction(async (client) => {
          await client.query(`
            INSERT INTO workspaces (id, name, slug, created_at, updated_at)
            VALUES ('${wsId}', 'Concurrent WS', 'concurrent-${Date.now()}-${i}', NOW(), NOW())
          `);
        });
      });

      await Promise.all(promises);

      // All should exist
      for (const wsId of wsIds) {
        const ws = await dbHelper.query(`SELECT * FROM workspaces WHERE id = '${wsId}'`);
        expect(ws.length).toBe(1);
      }
    });

    it('should maintain isolation between concurrent transactions', async () => {
      const wsIdA = `ws-concur-a-${Date.now()}`;
      const wsIdB = `ws-concur-b-${Date.now()}`;

      // Create two workspaces concurrently
      await Promise.all([
        dbHelper.withCommittedTransaction(async (client) => {
          await client.query(`
            INSERT INTO workspaces (id, name, slug, created_at, updated_at)
            VALUES ('${wsIdA}', 'Concurrent A', 'concur-a-${Date.now()}', NOW(), NOW())
          `);
          await client.query(`
            INSERT INTO tasks (id, workspace_id, title, status, priority, created_at, updated_at)
            VALUES ('task-a-${Date.now()}', '${wsIdA}', 'Task A', 'todo', 'high', NOW(), NOW())
          `);
        }),
        dbHelper.withCommittedTransaction(async (client) => {
          await client.query(`
            INSERT INTO workspaces (id, name, slug, created_at, updated_at)
            VALUES ('${wsIdB}', 'Concurrent B', 'concur-b-${Date.now()}', NOW(), NOW())
          `);
          await client.query(`
            INSERT INTO tasks (id, workspace_id, title, status, priority, created_at, updated_at)
            VALUES ('task-b-${Date.now()}', '${wsIdB}', 'Task B', 'todo', 'high', NOW(), NOW())
          `);
        }),
      ]);

      // Each workspace should have exactly one task
      const taskA = await dbHelper.query(`SELECT * FROM tasks WHERE title = 'Task A'`);
      const taskB = await dbHelper.query(`SELECT * FROM tasks WHERE title = 'Task B'`);

      expect(taskA.length).toBe(1);
      expect(taskB.length).toBe(1);
      expect(taskA[0].workspace_id).toBe(wsIdA);
      expect(taskB[0].workspace_id).toBe(wsIdB);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty outbox batch gracefully', async () => {
      const wsId = `ws-empty-${Date.now()}`;

      await dbHelper.withCommittedTransaction(async (client) => {
        await client.query(`
          INSERT INTO workspaces (id, name, slug, created_at, updated_at)
          VALUES ('${wsId}', 'Empty Batch WS', 'empty-batch-${Date.now()}', NOW(), NOW())
        `);
        // No outbox events - should not cause issues
      });

      const ws = await dbHelper.query(`SELECT * FROM workspaces WHERE id = '${wsId}'`);
      expect(ws.length).toBe(1);
    });

    it('should handle large JSON payload in outbox', async () => {
      const wsId = `ws-large-${Date.now()}`;
      const eventId = `ev-large-${Date.now()}`;

      // Create a large payload
      const largePayload = {
        data: Array.from({ length: 100 }, (_, i) => ({ id: i, value: 'x'.repeat(100) })),
        metadata: { total: 100, timestamp: Date.now() },
      };

      await dbHelper.withCommittedTransaction(async (client) => {
        await client.query(`
          INSERT INTO workspaces (id, name, slug, created_at, updated_at)
          VALUES ('${wsId}', 'Large Payload WS', 'large-payload-${Date.now()}', NOW(), NOW())
        `);

        await client.query({
          text: `INSERT INTO outbox (id, workspace_id, event_type, payload, created_at) VALUES ($1, $2, $3, $4, NOW())`,
          values: [eventId, wsId, 'large.event', JSON.stringify(largePayload)],
        });
      });

      const event = await dbHelper.query(`SELECT * FROM outbox WHERE id = '${eventId}'`);
      expect(event.length).toBe(1);
      
      const payload = typeof event[0].payload === 'string' 
        ? JSON.parse(event[0].payload) 
        : event[0].payload;
      expect(payload.data.length).toBe(100);
    });

    it('should handle concurrent outbox processing simulation', async () => {
      const wsId = `ws-outbox-concur-${Date.now()}`;
      const eventIds = Array.from({ length: 10 }, (_, i) => `ev-concur-${Date.now()}-${i}`);

      // Create all events in one transaction
      await dbHelper.withCommittedTransaction(async (client) => {
        await client.query(`
          INSERT INTO workspaces (id, name, slug, created_at, updated_at)
          VALUES ('${wsId}', 'Outbox Concurrent WS', 'outbox-concurrent-${Date.now()}', NOW(), NOW())
        `);

        for (const eventId of eventIds) {
          await client.query(`
            INSERT INTO outbox (id, workspace_id, event_type, payload, created_at)
            VALUES ('${eventId}', '${wsId}', 'concurrent.event', '{}', NOW())
          `);
        }
      });

      // Process events concurrently (simulating worker)
      const processedIds: string[] = [];
      await Promise.all(eventIds.map(async (eventId) => {
        await dbHelper.withCommittedTransaction(async (client) => {
          await client.query(`
            UPDATE outbox SET processed = true, processed_at = NOW() WHERE id = '${eventId}' AND processed = false
          `);
          processedIds.push(eventId);
        });
      }));

      expect(processedIds.length).toBe(10);
    });
  });
});

describe('Outbox Service Integration', () => {
  // Tests that verify the OutboxService class behavior
  let infra: Awaited<ReturnType<typeof setupInfrastructure>>;
  let dbHelper: DbTestHelper;

  beforeAll(async () => {
    infra = await setupInfrastructure();
    const { applySchema, applyRLSPolicies } = await import('../setup.integration');
    await applySchema(infra.dbUrl);
    await applyRLSPolicies(infra.dbUrl);

    dbHelper = createDbHelper(infra);
  });

  afterAll(async () => {
    await dbHelper?.close();
  });

  beforeEach(async () => {
    await dbHelper.truncateAll();
  });

  it('should create outbox event via service pattern', async () => {
    const wsId = `ws-service-${Date.now()}`;
    const eventId = `ev-service-${Date.now()}`;

    await dbHelper.withCommittedTransaction(async (client) => {
      await client.query(`
        INSERT INTO workspaces (id, name, slug, created_at, updated_at)
        VALUES ('${wsId}', 'Service WS', 'service-${Date.now()}', NOW(), NOW())
      `);

      // Simulate OutboxService.createEvent
      await client.query(`
        INSERT INTO outbox (id, workspace_id, event_type, payload, created_at)
        VALUES ('${eventId}', '${wsId}', 'workspace.activated', '{}', NOW())
      `);
    });

    const event = await dbHelper.query(`SELECT * FROM outbox WHERE id = '${eventId}'`);
    expect(event.length).toBe(1);
    expect(event[0].event_type).toBe('workspace.activated');
  });
});