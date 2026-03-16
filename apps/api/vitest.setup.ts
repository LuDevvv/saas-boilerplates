import { vi } from "vitest";

vi.mock("@workspace/db", async () => {
  const mockUsers = new Map();
  const mockWorkspaces = new Map();
  const mockMemberships = new Map();

  return {
    default: {
      select: vi.fn().mockImplementation(() => ({
        from: vi.fn().mockImplementation((table) => ({
          where: vi.fn().mockResolvedValue([]),
          innerJoin: vi.fn().mockResolvedValue([]),
        })),
      })),
      insert: vi.fn().mockImplementation(() => ({
        values: vi.fn().mockImplementation(() => ({
          returning: vi.fn().mockResolvedValue([]),
        })),
      })),
      update: vi.fn().mockImplementation(() => ({
        set: vi.fn().mockImplementation(() => ({
          where: vi.fn().mockResolvedValue([]),
        })),
      })),
      delete: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockResolvedValue([]),
      })),
    },
    users: {},
    accounts: {},
    sessions: {},
    workspaces: {},
    memberships: {},
    invitations: {},
    eq: vi.fn((a, b) => a === b),
    and: vi.fn((...args) => args.every(Boolean)),
    or: vi.fn((...args) => args.some(Boolean)),
    sql: vi.fn(),
  };
});

vi.mock("../../common/utils/crypto", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed_password"),
  verifyPassword: vi.fn().mockResolvedValue(true),
  generateRandomToken: vi.fn().mockReturnValue("random_token_123"),
}));

vi.mock("@hono/sentry", () => ({
  sentry: () => async (c: any, next: () => Promise<void>) => {
    await next();
  },
}));
