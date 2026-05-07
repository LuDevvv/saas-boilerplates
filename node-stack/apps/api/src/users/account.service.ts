import { Injectable, UnauthorizedException } from "@nestjs/common";
import {
  AuditLogRepository,
  AuthRepository,
  withSystemTx,
} from "@node-stack/db";
import * as bcrypt from "bcrypt";

import { AUTH_ERRORS } from "@/auth/constants.js";

/**
 * Self-service account closure (DELETE /api/v1/auth/me).
 *
 * Per ADR 0003: closes the account by setting users.deleted_at, hard-
 * deletes sessions (revoke tokens immediately), marks memberships as
 * 'removed'. The cron at MaintenanceService.anonymizeExpiredAccounts
 * (Phase 3c) replaces PII 30 days later.
 */
@Injectable()
export class AccountService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly auditLog: AuditLogRepository,
  ) {}

  async closeAccount(
    userId: string,
    password: string,
    reason: string | null,
    ctx: { ipAddress?: string | null; userAgent?: string | null } = {},
  ): Promise<void> {
    const user = await this.authRepository.findUserById(userId);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // Re-auth check: closing an account is a destructive action and
    // should require fresh password proof, not just a valid JWT.
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    await withSystemTx(async (tx) => {
      await this.authRepository.softDeleteUser(userId, userId, reason, tx);
      await this.auditLog.create(
        {
          workspaceId: null,
          userId,
          action: "auth.account_closed",
          entityType: "user",
          entityId: userId,
          metadata: { reason: reason ?? null },
          ipAddress: ctx.ipAddress ?? null,
          userAgent: ctx.userAgent ?? null,
        },
        tx,
      );
    }, this.authRepository.db);
  }
}
