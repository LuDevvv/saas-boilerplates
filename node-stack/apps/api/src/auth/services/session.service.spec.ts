import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import type { CacheService } from "@node-stack/cache";
import type { AuditLogRepository, AuthRepository, SessionRepository } from "@node-stack/db";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_ERRORS } from "@/auth/constants.js";

import { SessionService } from "./session.service.js";
import { TokenService } from "./token.service.js";

vi.mock("@node-stack/db", async () => {
  const actual = await vi.importActual<typeof import("@node-stack/db")>(
    "@node-stack/db",
  );
  return {
    ...actual,
    withSystemTx: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb({})),
  };
});

interface Mocks {
  sessionRepo: SessionRepository;
  authRepo: AuthRepository;
  auditLog: AuditLogRepository;
  cache: CacheService;
  tokenService: TokenService;
}

function buildMocks(): Mocks {
  const sessionRepo = {
    findActiveByUserId: vi.fn(),
    findActiveByUserIdPaged: vi.fn(),
    deleteById: vi.fn(),
    deleteAllExcept: vi.fn(),
    deleteAll: vi.fn(),
  } as unknown as SessionRepository;
  const authRepo = {
    db: {},
    findActiveSessionByUserAgent: vi.fn(),
    findActiveSessionById: vi.fn(),
    findUserById: vi.fn(),
    updateSessionActivity: vi.fn(),
    createSession: vi.fn(),
  } as unknown as AuthRepository;
  const auditLog = { create: vi.fn() } as unknown as AuditLogRepository;
  const cache = { del: vi.fn() } as unknown as CacheService;
  const tokenService = {
    getSessionExpiry: vi.fn(() => new Date(Date.now() + 30 * 86400000)),
    verifyRefreshToken: vi.fn(),
    generateTokens: vi.fn(),
  } as unknown as TokenService;
  return { sessionRepo, authRepo, auditLog, cache, tokenService };
}

describe("SessionService", () => {
  let mocks: Mocks;
  let svc: SessionService;

  beforeEach(() => {
    mocks = buildMocks();
    svc = new SessionService(
      mocks.sessionRepo,
      mocks.authRepo,
      mocks.auditLog,
      mocks.cache,
      mocks.tokenService,
    );
  });

  describe("revokeSession", () => {
    it("rejects with BadRequest when revoking the current session", async () => {
      await expect(
        svc.revokeSession("sess-1", "user-1", "sess-1"),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe("findOrCreateSession", () => {
    it("reuses an existing session when userAgent matches", async () => {
      (mocks.authRepo.findActiveSessionByUserAgent as any).mockResolvedValue({
        id: "sess-existing",
      });
      const result = await svc.findOrCreateSession("user-1", {
        userAgent: "Mozilla/5.0 Test",
        ipAddress: "1.1.1.1",
        rememberMe: true,
      });
      expect(result).toEqual({ sessionId: "sess-existing", reused: true });
      expect(mocks.authRepo.updateSessionActivity).toHaveBeenCalledWith(
        "sess-existing",
        expect.objectContaining({ ipAddress: "1.1.1.1" }),
      );
      expect(mocks.authRepo.createSession).not.toHaveBeenCalled();
    });

    it("creates a fresh session when no userAgent match exists", async () => {
      (mocks.authRepo.findActiveSessionByUserAgent as any).mockResolvedValue(
        undefined,
      );
      const result = await svc.findOrCreateSession("user-1", {
        userAgent: "New device",
      });
      expect(result.reused).toBe(false);
      expect(result.sessionId).toMatch(/^[0-9a-f-]{36}$/);
      expect(mocks.authRepo.createSession).toHaveBeenCalled();
    });
  });

  describe("refreshTokens", () => {
    it("throws Unauthorized when the JWT can't be verified", async () => {
      (mocks.tokenService.verifyRefreshToken as any).mockImplementation(() => {
        throw new Error("jwt malformed");
      });
      await expect(svc.refreshTokens("garbage"))
        .rejects.toBeInstanceOf(UnauthorizedException)
        .catch((err) => {
          expect((err as Error).message).toBe(AUTH_ERRORS.INVALID_TOKEN);
        });
    });

    it("throws Unauthorized when the payload type is not 'refresh'", async () => {
      (mocks.tokenService.verifyRefreshToken as any).mockReturnValue({
        sub: "u-1",
        email: "u@test.local",
        type: "access",
        sessionId: "sess-1",
      });
      await expect(svc.refreshTokens("token")).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
