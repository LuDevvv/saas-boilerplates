import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  afterAll,
} from "vitest";
import { createUserService } from "./user.service";
import {
  createTestDb,
  resetTestDb,
  closeTestDb,
  testUsers,
} from "@workspace/testing";
import { eq } from "drizzle-orm";

// We mock @workspace/db to intercept repository calls and redirect them
// to our SQLite-aware test tables when running in the Logic pool.
vi.mock("@workspace/db", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    UserRepository: {
      ...actual.UserRepository,
      update: vi.fn().mockImplementation(async (db, id, data) => {
        // Redirect to SQLite syntax/table
        const result = await db
          .update(testUsers)
          .set(data)
          .where(eq(testUsers.id, id))
          .returning();
        return result[0] ?? null;
      }),
      findById: vi.fn().mockImplementation(async (db, id) => {
        const result = await db
          .select()
          .from(testUsers)
          .where(eq(testUsers.id, id))
          .limit(1);
        return result[0] ?? null;
      }),
    },
  };
});

describe("UserService (Logic Pool)", () => {
  let db: ReturnType<typeof createTestDb>;
  let userService: ReturnType<typeof createUserService>;

  beforeEach(() => {
    db = createTestDb();
    // No KV namespace needed for basic logic validation here,
    // though it can be passed if we want to test cache invalidation too.
    userService = createUserService(db as any);
  });

  afterEach(() => {
    resetTestDb();
  });

  afterAll(() => {
    closeTestDb();
  });

  it("should update user profile using real SQLite transaction", async () => {
    // 1. Seed test data using the bridge table definition
    const userId = "user-123";
    await db.insert(testUsers).values({
      id: userId,
      email: "logic-test@example.com",
      name: "Old Name",
      role: "user",
      emailVerified: false,
    });

    // 2. Act: Call the service which orchestrates the update
    const result = await userService.updateProfile(userId, {
      name: "New Name",
      avatarUrl: "https://example.com/avatar.png",
    });

    // 3. Assert: Result from service is correct
    expect(result).not.toBeNull();
    expect(result?.name).toBe("New Name");

    // 4. Verification: The underlying SQLite database was actually updated
    const rows = await db
      .select()
      .from(testUsers)
      .where(eq(testUsers.id, userId))
      .limit(1);
    expect(rows[0].name).toBe("New Name");
    expect(rows[0].avatarUrl).toBe("https://example.com/avatar.png");
  });

  it("should handle updating non-existent user gracefully", async () => {
    const result = await userService.updateProfile("missing-id", {
      name: "Ghost User",
    });

    expect(result).toBeNull();
  });

  it("should unsuccessfully update a non-existent user", async () => {
    const result = await userService.updateProfile("non-existent", {
      name: "New Name",
    });
    expect(result).toBeNull();
  });

  it("should successfully update an existing user", async () => {
    const id = "update-me";
    await db
      .insert(testUsers)
      .values({
        id,
        email: "update@example.com",
        name: "Old Name",
      })
      .run();

    const updated = await userService.updateProfile(id, { name: "New Name" });
    expect(updated).not.toBeNull();
    expect(updated?.name).toBe("New Name");

    const [dbUser] = await db
      .select()
      .from(testUsers)
      .where(eq(testUsers.id, id))
      .all();
    expect(dbUser.name).toBe("New Name");
  });
});
