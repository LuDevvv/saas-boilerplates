import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  afterAll,
} from "vitest";
import { createAuthService } from "@workspace/services";
import {
  createTestDb,
  resetTestDb,
  closeTestDb,
  testUsers,
  testAccounts,
} from "@workspace/testing";
import { eq, and } from "drizzle-orm";

// Mock @workspace/db to use SQLite tables while maintaining logic flow
vi.mock("@workspace/db", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  const { testUsers, testAccounts, testSessions } =
    await import("@workspace/testing");
  const { eq, and } = await import("drizzle-orm");

  const parseUser = (user: any) => {
    if (!user) return null;
    return {
      ...user,
      twoFactorRecoveryCodes:
        typeof user.twoFactorRecoveryCodes === "string"
          ? JSON.parse(user.twoFactorRecoveryCodes)
          : user.twoFactorRecoveryCodes,
    };
  };

  return {
    ...actual,
    users: testUsers,
    accounts: testAccounts,
    UserRepository: {
      ...actual.UserRepository,
      findByEmail: vi.fn().mockImplementation(async (db, email) => {
        const rows = await db
          .select()
          .from(testUsers)
          .where(eq(testUsers.email, email))
          .limit(1);
        return parseUser(rows[0]);
      }),
      findById: vi.fn().mockImplementation(async (db, id) => {
        const rows = await db
          .select()
          .from(testUsers)
          .where(eq(testUsers.id, id))
          .limit(1);
        return parseUser(rows[0]);
      }),
      create: vi.fn().mockImplementation(async (db, data) => {
        const id = `user-${Math.random().toString(36).substring(7)}`;
        const sqliteData = {
          id,
          ...data,
          twoFactorRecoveryCodes: Array.isArray(data.twoFactorRecoveryCodes)
            ? JSON.stringify(data.twoFactorRecoveryCodes)
            : data.twoFactorRecoveryCodes,
        };
        db.insert(testUsers).values(sqliteData).run();
        const rows = db
          .select()
          .from(testUsers)
          .where(eq(testUsers.id, id))
          .all();
        return parseUser(rows[0]);
      }),
      update: vi.fn().mockImplementation(async (db, id, data) => {
        const sqliteData = {
          ...data,
          twoFactorRecoveryCodes: Array.isArray(data.twoFactorRecoveryCodes)
            ? JSON.stringify(data.twoFactorRecoveryCodes)
            : data.twoFactorRecoveryCodes,
        };
        db.update(testUsers).set(sqliteData).where(eq(testUsers.id, id)).run();
        return true;
      }),
    },
    SessionRepository: {
      ...actual.SessionRepository,
      create: vi.fn().mockImplementation(async (db, data) => {
        const result = await db.insert(testSessions).values(data).returning();
        return result[0];
      }),
    },
  };
});

// Mock dependencies for AuthService
const mockQueue: any = {
  enqueueWelcomeEmail: vi.fn().mockResolvedValue(undefined),
};

const mockJwt: any = {
  signToken: vi.fn().mockResolvedValue("mock-jwt-token"),
};

const mockTfa: any = {
  generateSecret: vi
    .fn()
    .mockReturnValue({ secret: "secret123", uri: "otpauth://..." }),
  verifyToken: vi.fn().mockReturnValue(true),
  generateRecoveryCodes: vi.fn().mockReturnValue(["code1", "code2"]),
};

describe("AuthService (Logic Pool)", () => {
  let db: any;
  let authService: any;

  beforeEach(() => {
    db = createTestDb();
    authService = createAuthService(db as any, mockQueue, mockJwt, mockTfa);
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetTestDb();
  });

  afterAll(() => {
    closeTestDb();
  });

  it("should successfully register a user", async () => {
    const result = await authService.register({
      email: "auth-test@example.com",
      password: "validpassword123",
      name: "Auth Test User",
    } as any);

    expect(result.token).toBe("mock-jwt-token");
    expect(result.user?.email).toBe("auth-test@example.com");
  });

  it("should login successfully and return pending2fa if enabled", async () => {
    const email = "2fa-test@example.com";
    const password = "password123";
    await authService.register({ email, password, name: "2FA User" } as any);
    const user = await db
      .select()
      .from(testUsers)
      .where(eq(testUsers.email, email))
      .get();
    await db
      .update(testUsers)
      .set({ twoFactorEnabled: true, twoFactorSecret: "xyz" })
      .where(eq(testUsers.id, user.id))
      .run();

    const result = await authService.login({ email, password });
    expect(result.pending2fa).toBe(true);
    expect(mockJwt.signToken).toHaveBeenCalledWith(
      expect.objectContaining({ pending2fa: true }),
    );
  });

  it("should allow social login and link account", async () => {
    const profile = {
      id: "google-123",
      email: "social@test.com",
      name: "Social User",
      avatarUrl: "",
    };
    const result = await authService.socialLogin("google", profile as any);

    expect(result.user?.email).toBe(profile.email);

    const linkedAccounts = await db
      .select()
      .from(testAccounts)
      .where(eq(testAccounts.provider, "google"))
      .all();
    expect(linkedAccounts).toHaveLength(1);
    expect(linkedAccounts[0].providerAccountId).toBe(profile.id);
  });

  it("should complete 2FA verification with valid token", async () => {
    const email = "verify-2fa@test.com";
    await authService.register({ email, password: "pw", name: "2FA" } as any);
    const user = await db
      .select()
      .from(testUsers)
      .where(eq(testUsers.email, email))
      .get();

    await db
      .update(testUsers)
      .set({
        twoFactorEnabled: true,
        twoFactorSecret: "secret123",
      })
      .where(eq(testUsers.id, user.id))
      .run();

    const result = await authService.verify2fa(user.id, "123456");
    expect(result.token).toBe("mock-jwt-token");
    expect(result.user?.id).toBe(user.id);
    expect(mockTfa.verifyToken).toHaveBeenCalledWith("secret123", "123456");
  });

  it("should complete 2FA verification with recovery code and consume it", async () => {
    const email = "recovery@test.com";
    await authService.register({
      email,
      password: "pw",
      name: "Recovery",
    } as any);
    const user = await db
      .select()
      .from(testUsers)
      .where(eq(testUsers.email, email))
      .get();

    // Setup 2FA with recovery codes
    await db
      .update(testUsers)
      .set({
        twoFactorEnabled: true,
        twoFactorSecret: "secret123",
        twoFactorRecoveryCodes: JSON.stringify(["code-used", "code-kept"]),
      })
      .where(eq(testUsers.id, user.id))
      .run();

    const result = await authService.verify2fa(user.id, undefined, "code-used");
    expect(result.token).toBe("mock-jwt-token");

    const updatedUser = await db
      .select()
      .from(testUsers)
      .where(eq(testUsers.id, user.id))
      .get();
    const codes = JSON.parse(updatedUser.twoFactorRecoveryCodes);
    expect(codes).toHaveLength(1);
    expect(codes).not.toContain("code-used");
  });

  it("should deny unlinking the only authentication method", async () => {
    const profile = {
      id: "google-123",
      email: "sole@test.com",
      name: "Sole User",
    };
    const result = await authService.socialLogin("google", profile as any);
    const userId = result.user?.id;

    await expect(authService.unlinkAccount(userId!, "google")).rejects.toThrow(
      "Cannot unlink the only authentication method.",
    );
  });
});
