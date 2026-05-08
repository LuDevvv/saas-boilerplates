import type { ConfigService } from "@nestjs/config";
import type { JwtService } from "@nestjs/jwt";
import { describe, expect, it, vi } from "vitest";

import { TokenService } from "./token.service.js";

function buildService(overrides: {
  jwtSign?: ReturnType<typeof vi.fn>;
  jwtVerify?: ReturnType<typeof vi.fn>;
  configGet?: (key: string) => string;
} = {}): TokenService {
  const jwt = {
    signAsync: overrides.jwtSign ?? vi.fn().mockResolvedValue("signed-token"),
    verify: overrides.jwtVerify ?? vi.fn(),
  } as unknown as JwtService;
  const config = {
    getOrThrow: vi.fn(
      overrides.configGet ??
        ((key: string) =>
          key === "JWT_SECRET" ? "access-secret" : "refresh-secret"),
    ),
  } as unknown as ConfigService;
  return new TokenService(jwt, config);
}

describe("TokenService", () => {
  describe("generateTokens", () => {
    it("signs an access + refresh pair tied to the same sessionId", async () => {
      const sign = vi
        .fn()
        .mockResolvedValueOnce("access-jwt")
        .mockResolvedValueOnce("refresh-jwt");
      const svc = buildService({ jwtSign: sign });

      const result = await svc.generateTokens("u-1", "u@test.local", "sess-1");

      expect(result).toEqual({
        accessToken: "access-jwt",
        refreshToken: "refresh-jwt",
        sessionId: "sess-1",
      });
      expect(sign).toHaveBeenCalledTimes(2);
    });

    it("generates a fresh sessionId when none is provided", async () => {
      const svc = buildService();
      const result = await svc.generateTokens("u-1", "u@test.local");
      expect(result.sessionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
  });

  describe("getSessionExpiry", () => {
    it("returns a 90-day window when rememberMe is true", () => {
      const svc = buildService();
      const expiry = svc.getSessionExpiry(true);
      const days = Math.round((expiry.getTime() - Date.now()) / 86400000);
      expect(days).toBe(90);
    });

    it("returns a 30-day window when rememberMe is false or omitted", () => {
      const svc = buildService();
      const expiry = svc.getSessionExpiry(false);
      const days = Math.round((expiry.getTime() - Date.now()) / 86400000);
      expect(days).toBe(30);
    });
  });

  describe("verifyRefreshToken", () => {
    it("propagates JwtService.verify failures so callers can translate", () => {
      const verify = vi.fn(() => {
        throw new Error("jwt malformed");
      });
      const svc = buildService({ jwtVerify: verify });
      expect(() => svc.verifyRefreshToken("garbage")).toThrow("jwt malformed");
    });
  });
});
