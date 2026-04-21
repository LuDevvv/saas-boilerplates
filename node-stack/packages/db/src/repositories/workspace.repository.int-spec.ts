import { createTestDb, truncateAll, TestDb } from '../testing/test-db.js';
import { createUser, createWorkspace } from '../factories/index.js';
import { WorkspaceRepository } from './workspace.repository.js';
import { withTransaction } from '../index.js';
import * as schema from '../schema/index.js';

describe('WorkspaceRepository (integration)', () => {
  let testDb: TestDb;
  let repo: WorkspaceRepository;

  beforeAll(async () => {
    testDb = await createTestDb();
    repo = new WorkspaceRepository(testDb.db);
  }, 60_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  beforeEach(async () => {
    await truncateAll(testDb.db);
  });

  it('findAllByUserId returns only workspaces the user belongs to', async () => {
    const owner = await createUser(testDb.db);
    const other = await createUser(testDb.db);
    const ws1   = await createWorkspace(testDb.db, owner.id);
    await createWorkspace(testDb.db, other.id); // different owner

    const { workspaces } = await repo.findAllByUserId(owner.id);
    expect(workspaces).toHaveLength(1);
    expect(workspaces[0].id).toBe(ws1.id);
  });

  it('cursor-based pagination returns correct page and nextCursor', async () => {
    const owner = await createUser(testDb.db);
    // Create 5 workspaces
    for (let i = 0; i < 5; i++) {
      await createWorkspace(testDb.db, owner.id, { name: `WS ${i}` });
    }

    const page1 = await repo.findAllByUserId(owner.id, undefined, 3);
    expect(page1.workspaces).toHaveLength(3);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = await repo.findAllByUserId(owner.id, page1.nextCursor!, 3);
    expect(page2.workspaces).toHaveLength(2);
    expect(page2.nextCursor).toBeNull();

    // No overlap between pages
    const ids1 = page1.workspaces.map(w => w.id);
    const ids2 = page2.workspaces.map(w => w.id);
    expect(ids1.filter(id => ids2.includes(id))).toHaveLength(0);
  });

  it('withTransaction rolls back on error — no partial data', async () => {
    const owner = await createUser(testDb.db);
    const before = await repo.findAllByUserId(owner.id);

    try {
      await withTransaction(async (tx) => {
        await (tx as any).insert(schema.workspaces).values({
          name: 'Will rollback', slug: 'will-rollback',
        });
        throw new Error('Simulated failure');
      }, testDb.db as any);
    } catch (_) { /* expected */ }

    const after = await repo.findAllByUserId(owner.id);
    expect(after.workspaces).toHaveLength(before.workspaces.length);
  });

  it('unique slug constraint rejects duplicate slugs', async () => {
    const owner = await createUser(testDb.db);
    await createWorkspace(testDb.db, owner.id, { slug: 'duplicate' });

    await expect(
      createWorkspace(testDb.db, owner.id, { slug: 'duplicate' })
    ).rejects.toThrow();
  });
});
