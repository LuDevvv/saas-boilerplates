import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db as superDb, pool as superPool, resetDatabase } from './test-db.js';
import { workspaces, tasks, sql } from '../index.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../schema/index.js';

describe('Row Level Security (RLS)', () => {
  let appDb: any;
  let appPool: Pool;

  beforeAll(async () => {
    await resetDatabase(superDb);
    
    // Create a connection as the non-superuser app_user
    const dbUrl = process.env.DATABASE_URL!.replace('test_user:test_pass', 'app_user:app_pass');
    appPool = new Pool({ connectionString: dbUrl });
    appDb = drizzle(appPool, { schema });
  });

  afterAll(async () => {
    await appPool?.end();
    await superPool?.end();
  });

  it('should isolate data between workspaces at the database level', async () => {
    // 1. Setup: Create two workspaces (using superuser to bypass RLS for setup)
    const [wsA] = await superDb.insert(workspaces).values({ name: 'Workspace A', slug: 'ws-a' }).returning();
    const [wsB] = await superDb.insert(workspaces).values({ name: 'Workspace B', slug: 'ws-b' }).returning();

    // 2. Setup: Create a task for Workspace B
    const [taskB] = await superDb.insert(tasks).values({
      workspaceId: wsB.id,
      title: 'Task for Workspace B',
    }).returning();

    // 3. Query as Workspace A (using app_user connection)
    await appDb.transaction(async (tx: any) => {
      await tx.execute(sql.raw(`SET LOCAL "app.current_workspace_id" = '${wsA.id}'`));
      
      const wsATasks = await tx.select().from(tasks);
      expect(wsATasks).toHaveLength(0);
    });

    // 4. Query as Workspace B (using app_user connection)
    await appDb.transaction(async (tx: any) => {
      await tx.execute(sql.raw(`SET LOCAL "app.current_workspace_id" = '${wsB.id}'`));
      
      const wsBTasks = await tx.select().from(tasks);
      expect(wsBTasks).toHaveLength(1);
      expect(wsBTasks[0].id).toBe(taskB.id);
    });
  });
});
