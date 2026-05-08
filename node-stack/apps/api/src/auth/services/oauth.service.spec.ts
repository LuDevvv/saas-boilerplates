import type { AuthRepository } from "@node-stack/db";
import type { OAuthProfile } from "@node-stack/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OAuthService } from "./oauth.service.js";
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
  authRepo: AuthRepository;
  tokenService: TokenService;
}

function buildMocks(): Mocks {
  const authRepo = {
    db: {},
    findOAuthLink: vi.fn(),
    findUserByEmail: vi.fn(),
    findUserById: vi.fn(),
    createUser: vi.fn(),
    createOAuthAccount: vi.fn(),
    updateOAuthAccessToken: vi.fn(),
    createOutboxEvent: vi.fn(),
    createSession: vi.fn(),
  } as unknown as AuthRepository;
  const tokenService = {
    getSessionExpiry: vi.fn(() => new Date(Date.now() + 30 * 86400000)),
    generateTokens: vi.fn().mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
      sessionId: "s",
    }),
  } as unknown as TokenService;
  return { authRepo, tokenService };
}

const baseProfile: OAuthProfile = {
  provider: "google",
  providerAccountId: "google-123",
  email: "u@test.local",
  name: "Test User",
  accessToken: "google-access",
  refreshToken: null,
};

describe("OAuthService", () => {
  let mocks: Mocks;
  let svc: OAuthService;

  beforeEach(() => {
    mocks = buildMocks();
    svc = new OAuthService(mocks.authRepo, mocks.tokenService);
  });

  it("reuses the linked user when a provider/account row already exists", async () => {
    (mocks.authRepo.findOAuthLink as any).mockResolvedValue({
      id: "link-1",
      userId: "user-existing",
    });
    (mocks.authRepo.findUserById as any).mockResolvedValue({
      id: "user-existing",
      email: "u@test.local",
    });

    const result = await svc.handleOAuthLogin(baseProfile);

    expect(mocks.authRepo.updateOAuthAccessToken).toHaveBeenCalledWith(
      "link-1",
      "google-access",
      expect.anything(),
    );
    expect(mocks.authRepo.createUser).not.toHaveBeenCalled();
    expect(mocks.tokenService.generateTokens).toHaveBeenCalled();
    expect(result).toEqual({ accessToken: "a", refreshToken: "r" });
  });

  it("creates a fresh user + outbox event when neither link nor matching email exists", async () => {
    (mocks.authRepo.findOAuthLink as any).mockResolvedValue(null);
    (mocks.authRepo.findUserByEmail as any).mockResolvedValue(null);
    (mocks.authRepo.createUser as any).mockResolvedValue({
      id: "user-new",
      email: "u@test.local",
    });

    await svc.handleOAuthLogin(baseProfile);

    expect(mocks.authRepo.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: "u@test.local", emailVerified: true }),
      expect.anything(),
    );
    expect(mocks.authRepo.createOutboxEvent).toHaveBeenCalledWith(
      "user.registered.oauth",
      expect.objectContaining({ provider: "google" }),
      expect.anything(),
    );
  });

  it("propagates repository errors instead of swallowing them", async () => {
    (mocks.authRepo.findOAuthLink as any).mockResolvedValue(null);
    (mocks.authRepo.findUserByEmail as any).mockRejectedValue(
      new Error("db unreachable"),
    );

    await expect(svc.handleOAuthLogin(baseProfile)).rejects.toThrow(
      "db unreachable",
    );
  });
});
