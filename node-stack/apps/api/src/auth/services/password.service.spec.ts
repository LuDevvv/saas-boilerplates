import { UnauthorizedException } from "@nestjs/common";
import type { AuditLogRepository, AuthRepository } from "@node-stack/db";
import * as bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PasswordService } from "./password.service.js";
import { SessionService } from "./session.service.js";

interface Mocks {
  authRepo: AuthRepository;
  auditLog: AuditLogRepository;
  sessionService: SessionService;
}

function buildMocks(): Mocks {
  const authRepo = {
    findUserByEmail: vi.fn(),
    findVerificationToken: vi.fn(),
  } as unknown as AuthRepository;
  const auditLog = { create: vi.fn() } as unknown as AuditLogRepository;
  const sessionService = {
    revokeAllOtherSessions: vi.fn(),
  } as unknown as SessionService;
  return { authRepo, auditLog, sessionService };
}

describe("PasswordService", () => {
  let mocks: Mocks;
  let svc: PasswordService;

  beforeEach(() => {
    mocks = buildMocks();
    svc = new PasswordService(
      mocks.authRepo,
      mocks.auditLog,
      mocks.sessionService,
    );
  });

  describe("validateUser", () => {
    it("throws Unauthorized when the email is unknown", async () => {
      (mocks.authRepo.findUserByEmail as any).mockResolvedValue(null);
      await expect(
        svc.validateUser("missing@test.local", "any"),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("throws Unauthorized when the bcrypt hash mismatches", async () => {
      const hash = await bcrypt.hash("secret-actual", 4);
      (mocks.authRepo.findUserByEmail as any).mockResolvedValue({
        id: "u-1",
        email: "u@test.local",
        passwordHash: hash,
      });
      await expect(
        svc.validateUser("u@test.local", "secret-wrong"),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("returns the user shape on a correct password", async () => {
      const hash = await bcrypt.hash("right", 4);
      (mocks.authRepo.findUserByEmail as any).mockResolvedValue({
        id: "u-1",
        email: "u@test.local",
        passwordHash: hash,
      });
      await expect(
        svc.validateUser("u@test.local", "right"),
      ).resolves.toEqual({ id: "u-1", email: "u@test.local", passwordHash: hash });
    });
  });

  describe("hashPassword", () => {
    it("returns a bcrypt hash that round-trips with bcrypt.compare", async () => {
      const hash = await svc.hashPassword("plaintext-secret");
      expect(hash).toMatch(/^\$2[aby]\$/);
      await expect(bcrypt.compare("plaintext-secret", hash)).resolves.toBe(
        true,
      );
    });
  });
});
