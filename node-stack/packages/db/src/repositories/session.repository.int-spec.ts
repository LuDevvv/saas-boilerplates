import { SessionRepository } from './session.repository.js';
import { createUser } from '../factories/index.js';
import * as schema from '../schema/index.js';
import { createTestDb, truncateAll, TestDb } from '../testing/test-db.js';

describe('SessionRepository (integration)', () => {
  let testDb: TestDb;
  let repo: SessionRepository;

  beforeAll(async () => {
    testDb = await createTestDb();
    repo = new SessionRepository(testDb.db);
  }, 60_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  beforeEach(async () => {
    await truncateAll(testDb.db);
  });

  it('findActiveByUserId returns only non-expired sessions', async () => {
    const user = await createUser(testDb.db);
    
    // Non-expired
    const [active] = await testDb.db.insert(schema.sessions).values({
      userId: user.id,
      expiresAt: new Date(Date.now() + 3600000), // +1h
    }).returning();

    // Expired
    await testDb.db.insert(schema.sessions).values({
      userId: user.id,
      expiresAt: new Date(Date.now() - 3600000), // -1h
    });

    const sessions = await repo.findActiveByUserId(user.id);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe(active.id);
  });

  it('deleteById with wrong userId does NOT delete (security check)', async () => {
    const user1 = await createUser(testDb.db);
    const user2 = await createUser(testDb.db);
    
    const [session] = await testDb.db.insert(schema.sessions).values({
      userId: user1.id,
      expiresAt: new Date(Date.now() + 3600000),
    }).returning();

    // Attempt delete user1 session as user2
    await repo.deleteById(session.id, user2.id);

    const remained = await testDb.db.select().from(schema.sessions);
    expect(remained).toHaveLength(1);
  });

  it('deleteAllExcept removes all sessions except the specified one', async () => {
    const user = await createUser(testDb.db);
    
    const [keep] = await testDb.db.insert(schema.sessions).values({
      userId: user.id,
      expiresAt: new Date(Date.now() + 3600000),
    }).returning();

    await testDb.db.insert(schema.sessions).values([
      {
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600000),
      },
      {
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600000),
      },
    ]);

    await repo.deleteAllExcept(user.id, keep.id);

    const remained = await testDb.db.select().from(schema.sessions);
    expect(remained).toHaveLength(1);
    expect(remained[0].id).toBe(keep.id);
  });
});
