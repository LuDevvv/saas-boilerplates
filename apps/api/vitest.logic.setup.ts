import { vi } from "vitest";

/**
 * Global setup for the 'Logic' pool (Node.js environment).
 * Mocks external dependencies and services that are not part of core business logic.
 */

// Sentry middleware mock
vi.mock("@hono/sentry", () => ({
  sentry: () => async (c: any, next: () => Promise<void>) => {
    await next();
  },
}));

// Mock crypto by default for speed, though real WebCrypto is available in Node.
vi.mock("../../common/utils/crypto", () => ({
  hashPassword: vi.fn().mockResolvedValue("salt.hashed_password"),
  verifyPassword: vi
    .fn()
    .mockImplementation((password: string, hash: string) => {
      return Promise.resolve(
        password === "validpassword" || hash.includes("hashed_password"),
      );
    }),
  generateRandomToken: vi.fn().mockReturnValue("random_token_123"),
}));

// --- Important Note ---
// We do NOT mock @workspace/db globally here in the Logic pool.
// Instead, .spec.ts files use @workspace/testing bridge for real SQLite operations,
// or provide their own specific mocks if needed for pure logic isolation.
