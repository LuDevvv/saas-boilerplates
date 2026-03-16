import { describe, it, expect, vi, beforeEach } from "vitest";
import { authGuard } from "./authGuard";
import type { AppContext } from "../types/env";

vi.mock("hono/jwt", () => ({
  verify: vi.fn(),
}));

vi.mock("@workspace/db", () => ({
  createDbClient: vi.fn().mockReturnValue({}),
  UserRepository: {
    findById: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock("../services/cache.service", () => ({
  createCacheService: vi.fn().mockReturnValue({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
  }),
  CACHE_KEYS: {
    userSession: (userId: string) => `session:${userId}`,
  },
}));

describe("authGuard Middleware", () => {
  let mockContext: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockNext = vi.fn().mockResolvedValue(undefined);

    mockContext = {
      req: {
        header: vi.fn((name: string) => {
          if (name === "Authorization") return "Bearer valid_token";
          return null;
        }),
      } as any,
      env: {
        JWT_SECRET: "test-secret-key",
        CACHE_KV: {},
        DATABASE_URL: "postgres://test:test@localhost:5432/test",
      } as any,
      set: vi.fn(),
      get: vi.fn(),
    } as unknown as AppContext;
  });

  it("should throw error if Authorization header is missing", async () => {
    mockContext.req.header = vi.fn(() => null);

    await (
      expect(authGuard(mockContext as any, mockNext)) as any
    ).rejects.toThrow();
  });

  it("should throw error if Authorization header has invalid format", async () => {
    mockContext.req.header = vi.fn((name: string) => {
      if (name === "Authorization") return "InvalidFormat";
      return null;
    });

    await expect(authGuard(mockContext as any, mockNext)).rejects.toThrow();
  });

  it("should call next() and set user context on valid token with cache hit", async () => {
    const { verify } = await import("hono/jwt");
    (verify as any).mockResolvedValue({
      sub: "user-123",
      email: "test@example.com",
    });

    const { createCacheService } = await import("../services/cache.service");
    (createCacheService as any).mockReturnValue({
      get: vi.fn().mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        role: "user",
        name: "Test User",
        avatarUrl: null,
      }),
      set: vi.fn().mockResolvedValue(undefined),
    });

    await authGuard(mockContext as any, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockContext.set).toHaveBeenCalledWith("userId", "user-123");
  });
});
