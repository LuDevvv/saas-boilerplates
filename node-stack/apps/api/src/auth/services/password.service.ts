import * as crypto from "crypto";

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import {
  AuditLogRepository,
  AuthRepository,
  withSystemTx,
} from "@node-stack/db";
import type { Database } from "@node-stack/db";
import { OutboxProducer } from "@node-stack/outbox-queue";
import * as bcrypt from "bcrypt";

import { AUTH_ERRORS } from "@/auth/constants.js";
import { SessionService } from "@/auth/services/session.service.js";

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_HOURS = 1;

export interface ValidateUserResult {
  id: string;
  email: string;
  passwordHash: string;
}

@Injectable()
export class PasswordService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly auditLog: AuditLogRepository,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Verifies an email/password pair against the stored bcrypt hash.
   * Throws UnauthorizedException with the canonical AUTH_ERRORS
   * message for both "user not found" and "wrong password" so the
   * response shape doesn't leak which one failed.
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<ValidateUserResult> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
    };
  }

  async hashPassword(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, BCRYPT_ROUNDS);
  }

  /**
   * Issues a one-hour password-reset token. Returns silently when
   * the email is not registered so that callers cannot enumerate
   * accounts; the audit row is also only written for known users.
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.authRepository.findUserByEmail(email.toLowerCase());
    if (!user) return;

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_TTL_HOURS);

    let outboxEventId: string | null = null;
    await withSystemTx(async (tx: Database) => {
      await this.authRepository.deleteVerificationTokensByUser(
        user.id,
        "password_reset",
        tx,
      );
      await this.authRepository.createVerificationToken(
        {
          identifier: "password_reset",
          token,
          expiresAt,
          userId: user.id,
        },
        tx,
      );
      outboxEventId = await this.authRepository.createOutboxEvent(
        "user.forgot_password",
        { userId: user.id, email: user.email, token },
        tx,
      );
      await this.auditLog.create(
        {
          workspaceId: null,
          userId: user.id,
          action: "auth.password_reset_requested",
          entityType: "user",
          entityId: user.id,
          metadata: { email: user.email },
        },
        tx,
      );
    }, this.authRepository.db);

    if (outboxEventId) {
      await OutboxProducer.addProcessOutboxJob(outboxEventId);
    }
  }

  /**
   * Consumes a reset token: re-hashes the password, deletes the
   * token row, emits the password-changed outbox event, writes the
   * audit row, and then revokes every active session for the user.
   * Session revocation runs *after* the password change transaction
   * commits so a transient failure leaves the password as-is.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const verification = await this.authRepository.findVerificationToken(
      "password_reset",
      token,
    );
    if (!verification || verification.expiresAt < new Date()) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    const passwordHash = await this.hashPassword(newPassword);

    await withSystemTx(async (tx: Database) => {
      await this.authRepository.updateUser(
        verification.userId,
        { passwordHash },
        tx,
      );
      await this.authRepository.deleteVerificationToken(token, tx);
      await this.authRepository.createOutboxEvent(
        "user.password_changed",
        { userId: verification.userId },
        tx,
      );
      await this.auditLog.create(
        {
          workspaceId: null,
          userId: verification.userId,
          action: "auth.password_reset_completed",
          entityType: "user",
          entityId: verification.userId,
          metadata: { via: "reset_token" },
        },
        tx,
      );
    }, this.authRepository.db);

    await this.sessionService.revokeAllOtherSessions(verification.userId, "");
  }
}
