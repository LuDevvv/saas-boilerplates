import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { db as superDb, resetDatabase } from './test-db.js';
import { RequestContextService } from '../context/request-context.service.js';
import { withTransaction } from '../index.js';
import { workspaces, tasks } from '../schema/index.js';
import * as schema from '../schema/index.js';

describe('Automatic RLS Enforcement', () => {
  let appDb: NodePgDatabase<typeof schema>;
  let appPool: Pool;
  const context = new RequestContextService();

  beforeAll(async () => {
    await resetDatabase(superDb);

    // Create a connection as the non-superuser app_user to trigger RLS enforcement
    const dbUrl = process.env.DATABASE_URL!.replace('test_user:test_pass', 'app_user:app_pass');
    appPool = new Pool({ connectionString: dbUrl });
    appDb = drizzle(appPool, { schema });
  });

  afterAll(async () => {
    await appPool?.end();
  });

  it('should automatically set RLS context using withTransaction from RequestContext', async () => {
    // 1. Setup: Create two workspaces
    const [wsA] = await superDb.insert(workspaces).values({ name: 'Auto Workspace A', slug: 'auto-ws-a' }).returning();
    const [wsB] = await superDb.insert(workspaces).values({ name: 'Auto Workspace B', slug: 'auto-ws-b' }).returning();

    // 2. Setup: Create a task for Workspace B
    await superDb.insert(tasks).values({
      workspaceId: wsB.id,
      title: 'Task for Workspace B',
    });

    // 3. Test: Query within Workspace A context
    // withTransaction should automatically execute SET LOCAL "app.current_workspace_id" = wsA.id
    await context.run({ workspaceId: wsA.id }, async () => {
      await withTransaction(async (tx) => {
        const wsATasks = await tx.select().from(tasks);
        expect(wsATasks).toHaveLength(0);
      }, appDb);
    });

    // 4. Test: Query within Workspace B context
    // withTransaction should automatically execute SET LOCAL "app.current_workspace_id" = wsB.id
    await context.run({ workspaceId: wsB.id }, async () => {
      await withTransaction(async (tx) => {
        const wsBTasks = await tx.select().from(tasks);
        expect(wsBTasks).toHaveLength(1);
        expect(wsBTasks[0].title).toBe('Task for Workspace B');
      }, appDb);
    });
  });
});
