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
    findUserById: vi.fn(),
    findVerificationToken: vi.fn(),
    updateUser: vi.fn(),
    deleteVerificationToken: vi.fn(),
    createOutboxEvent: vi.fn(),
    db: {
      transaction: vi.fn((cb) => cb({
        execute: vi.fn(),
      })),
    },
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

  describe("changePassword", () => {
    it("updates password and writes audit log when current password matches", async () => {
      const oldHash = await svc.hashPassword("old-pass");
      (mocks.authRepo.findUserById as any).mockResolvedValue({
        id: "u-1",
        passwordHash: oldHash,
      });

      await svc.changePassword("u-1", "old-pass", "new-pass", {
        ipAddress: "1.2.3.4",
        userAgent: "Agent",
      });

      expect(mocks.authRepo.updateUser).toHaveBeenCalledWith(
        "u-1",
        expect.objectContaining({ passwordHash: expect.any(String) }),
        expect.anything(),
      );
      expect(mocks.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "auth.password_changed",
          ipAddress: "1.2.3.4",
          userAgent: "Agent",
        }),
        expect.anything(),
      );
      expect(mocks.sessionService.revokeAllOtherSessions).toHaveBeenCalled();
    });

    it("throws Unauthorized when current password mismatches", async () => {
      const actualHash = await svc.hashPassword("correct");
      (mocks.authRepo.findUserById as any).mockResolvedValue({
        id: "u-1",
        passwordHash: actualHash,
      });

      await expect(
        svc.changePassword("u-1", "wrong", "new-pass"),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe("resetPassword", () => {
    it("consumes token and logs completion with IP/UA", async () => {
      (mocks.authRepo.findVerificationToken as any).mockResolvedValue({
        userId: "u-1",
        expiresAt: new Date(Date.now() + 10000),
      });

      await svc.resetPassword("tok-1", "new-pass", {
        ipAddress: "8.8.8.8",
      });

      expect(mocks.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "auth.password_reset_completed",
          ipAddress: "8.8.8.8",
        }),
        expect.anything(),
      );
    });
  });
});
