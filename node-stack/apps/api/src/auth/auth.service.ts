import * as crypto from "node:crypto";

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  withSystemTx,
  AuthRepository,
  AuditLogRepository,
} from "@node-stack/db";
import type { Database } from "@node-stack/db";
import * as schema from "@node-stack/db/schema";
import { OutboxProducer } from "@node-stack/outbox-queue";
import type { OAuthProfile } from "@node-stack/types";
import { encodeCursor, decodeCursor } from "@node-stack/utils";
import { buildPage, type PaginatedResponse } from "@node-stack/validators";

import { AUTH_ERRORS } from "@/auth/constants.js";
import type { RegisterDto, LoginDto, RefreshDto } from "@/auth/dto/index.js";
import { OAuthService } from "@/auth/services/oauth.service.js";
import { PasswordService, type ValidateUserResult } from "@/auth/services/password.service.js";
import { SessionService, type SessionListItem } from "@/auth/services/session.service.js";
import type { TokenPair } from "@/auth/services/token.service.js";
import { TokenService } from "@/auth/services/token.service.js";
import { TwoFactorService } from "@/auth/two-factor/two-factor.service.js";

export type { TokenPair } from "@/auth/services/token.service.js";
export type { SessionListItem } from "@/auth/services/session.service.js";
export type { ValidateUserResult } from "@/auth/services/password.service.js";

interface ListCursor extends Record<string, unknown> {
  createdAt: string;
  id: string;
}

interface ListPageOptions {
  cursor?: string;
  limit?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private twoFactorService: TwoFactorService,
    private authRepository: AuthRepository,
    private auditLog: AuditLogRepository,
    private tokenService: TokenService,
    private sessionService: SessionService,
    private passwordService: PasswordService,
    private oauthService: OAuthService,
    private eventEmitter: EventEmitter2,
  ) { }

  getActiveSessions(
    userId: string,
    currentSessionId: string,
    options: ListPageOptions = {},
  ): Promise<PaginatedResponse<SessionListItem>> {
    return this.sessionService.getActiveSessions(userId, currentSessionId, options);
  }

  revokeSession(
    sessionId: string,
    userId: string,
    currentSessionId: string,
    ctx: { ipAddress?: string | null; userAgent?: string | null } = {},
  ): Promise<void> {
    return this.sessionService.revokeSession(
      sessionId,
      userId,
      currentSessionId,
      ctx,
    );
  }

  revokeAllOtherSessions(
    userId: string,
    currentSessionId?: string,
    ctx: { ipAddress?: string | null; userAgent?: string | null } = {},
  ): Promise<{ count: number }> {
    return this.sessionService.revokeAllOtherSessions(
      userId,
      currentSessionId,
      ctx,
    );
  }

  async register(
    dto: RegisterDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<
    TokenPair & { token: string; user: { id: string; email: string; firstName: string | null; lastName: string | null; phone: string | null } }
  > {
    const passwordHash = await this.passwordService.hashPassword(dto.password);
    const sessionId = crypto.randomUUID();

    let outboxEventId: string | null = null;
    const user = await withSystemTx(async (tx: Database) => {
      const existingUser = await this.authRepository.findUserByEmail(
        dto.email.toLowerCase(),
        tx,
      );

      if (existingUser) {
        throw new ConflictException(AUTH_ERRORS.USER_EXISTS);
      }

      const newUser = await this.authRepository.createUser(
        {
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.firstName,
          lastName: dto.lastName,
        },
        tx,
      );

      const expiresAt = this.getSessionExpiry(false);
      await this.authRepository.createSession(
        {
          id: sessionId,
          userId: newUser.id,
          expiresAt,
          rememberMe: false,
          userAgent,
          ipAddress,
        },
        tx,
      );

      outboxEventId = await this.authRepository.createOutboxEvent(
        "user.registered",
        { userId: newUser.id, email: newUser.email },
        tx,
      );

      await this.auditLog.create(
        {
          workspaceId: null,
          userId: newUser.id,
          action: "auth.user_registered",
          entityType: "user",
          entityId: newUser.id,
          metadata: { email: newUser.email },
          ipAddress: ipAddress ?? null,
          userAgent: userAgent ?? null,
        },
        tx,
      );

      return newUser;
    }, this.authRepository.db);

    if (outboxEventId) {
      await OutboxProducer.addProcessOutboxJob(outboxEventId);
    }

    const tokens = await this.generateTokens(user.id, user.email, sessionId);

    return {
      ...tokens,
      token: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.name,
        lastName: user.lastName,
        phone: user.phone,
      },
    };
  }

  async login(
    dto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<
    | (TokenPair & { token: string; user: { id: string; email: string; firstName: string | null; lastName: string | null; phone: string | null } })
    | { requires2FA: true; tempToken: string }
  > {
    let user;
    try {
      user = await this.passwordService.validateUser(
        dto.email.toLowerCase(),
        dto.password,
      );
    } catch (err) {
      // Log the failed attempt before re-throwing. Email is recorded but
      // the password is never touched here, satisfying the redaction rule
      // for audit metadata.
      await withSystemTx(async (tx: Database) => {
        await this.auditLog.create(
          {
            workspaceId: null,
            userId: null,
            action: "auth.login_failed",
            entityType: "user",
            entityId: null,
            metadata: { email: dto.email.toLowerCase() },
            ipAddress: ipAddress ?? null,
            userAgent: userAgent ?? null,
          },
          tx,
        );
      }, this.authRepository.db);
      throw err;
    }

    const fullUser = await this.authRepository.findUserById(user.id);

    if (fullUser?.twoFactorEnabled) {
      const tempToken = this.twoFactorService.generateTempToken(user.id);
      return { requires2FA: true, tempToken };
    }

    const { sessionId, reused } = await this.sessionService.findOrCreateSession(
      user.id,
      { userAgent, ipAddress, rememberMe: dto.rememberMe },
    );

    const tokens = await this.generateTokens(user.id, user.email, sessionId);

    await withSystemTx(async (tx: Database) => {
      await this.auditLog.create(
        {
          workspaceId: null,
          userId: user.id,
          action: "auth.login_succeeded",
          entityType: "session",
          entityId: sessionId,
          metadata: { reused },
          ipAddress: ipAddress ?? null,
          userAgent: userAgent ?? null,
        },
        tx,
      );
    }, this.authRepository.db);

    return {
      ...tokens,
      token: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: fullUser?.name ?? null,
        lastName: fullUser?.lastName ?? null,
        phone: fullUser?.phone ?? null,
      },
    };
  }

  refresh(dto: RefreshDto): Promise<TokenPair> {
    return this.sessionService.refreshTokens(dto.refreshToken);
  }

  forgotPassword(email: string): Promise<void> {
    return this.passwordService.forgotPassword(email);
  }

  resetPassword(
    token: string, 
    newPassword: string,
    ctx: { ipAddress?: string | null; userAgent?: string | null } = {},
  ): Promise<void> {
    return this.passwordService.resetPassword(token, newPassword, ctx);
  }

  changePassword(
    userId: string,
    dto: { currentPassword: string; newPassword: string },
    ctx: { ipAddress?: string | null; userAgent?: string | null } = {},
  ): Promise<void> {
    return this.passwordService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
      ctx,
    );
  }

  async sendVerificationEmail(userId: string): Promise<void> {
    const user = await this.authRepository.findUserById(userId);
    if (!user || user.emailVerified) return;

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    let outboxEventId: string | null = null;
    await withSystemTx(async (tx: Database) => {
      // Invalidate any previous verification tokens for this user
      await this.authRepository.deleteVerificationTokensByUser(userId, "email_verification", tx);

      await this.authRepository.createVerificationToken({
        identifier: "email_verification",
        token,
        expiresAt,
        userId,
      }, tx);

      outboxEventId = await this.authRepository.createOutboxEvent(
        "user.email_verification",
        { userId, email: user.email, token },
        tx
      );
    }, this.authRepository.db);

    if (outboxEventId) {
      await OutboxProducer.addProcessOutboxJob(outboxEventId);
    }
  }

  async verifyEmail(token?: string, email?: string, code?: string): Promise<void> {
    let verificationToken = token;

    if (!verificationToken && email && code) {
      // In a real app, you would find the code in the DB.
      // For now, let's just use the same verification table but with 'code' as token.
      // Or we can just throw if not implemented yet.
      throw new BadRequestException("Verification by code not implemented yet in service");
    }

    const finalToken = verificationToken;

    if (!finalToken) {
      throw new BadRequestException("Verification token is required");
    }

    const verification = await this.authRepository.findVerificationToken("email_verification", finalToken);

    if (!verification || verification.expiresAt < new Date()) {
      throw new BadRequestException("Invalid or expired verification token");
    }

    await withSystemTx(async (tx: Database) => {
      await this.authRepository.updateUser(verification.userId, { emailVerified: true }, tx);
      await this.authRepository.deleteVerificationToken(finalToken, tx);

      await this.authRepository.createOutboxEvent(
        "user.email_verified",
        { userId: verification.userId },
        tx
      );
    }, this.authRepository.db);
  }

  async getAuditLogs(
    userId: string,
    options: ListPageOptions = {},
  ): Promise<PaginatedResponse<typeof schema.auditLogs.$inferSelect>> {
    const limit = options.limit ?? 20;
    const cursor = options.cursor
      ? decodeCursor<ListCursor>(options.cursor)
      : null;

    // User-scoped read crosses workspaces (a user may have entries
    // across every workspace they're a member of); withSystemTx so the
    // policy doesn't filter by a single tenant GUC.
    const rows = await withSystemTx(
      (tx) =>
        this.authRepository.getAuthAuditLogs(userId, tx, {
          limit: limit + 1,
          cursorCreatedAt: cursor ? new Date(cursor.createdAt) : null,
          cursorId: cursor?.id ?? null,
        }),
      this.authRepository.db,
    );

    return buildPage(rows, limit, (row) =>
      encodeCursor({ createdAt: row.createdAt.toISOString(), id: row.id }),
    );
  }

  async logout(sessionId: string): Promise<void> {
    await this.authRepository.deleteSessionById(sessionId);
  }

  validateUser(
    email: string,
    password: string,
  ): Promise<ValidateUserResult> {
    return this.passwordService.validateUser(email, password);
  }

  async getUserById(userId: string): Promise<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    jobTitle: string | null;
    onboardingStatus: string;
    role: string;
    createdAt: Date;
    twoFactorEnabled: boolean;
    emailVerified: boolean;
  }> {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.USER_NOT_FOUND);
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.name,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      jobTitle: user.jobTitle,
      onboardingStatus: user.onboardingStatus,
      role: user.role,
      createdAt: user.createdAt,
      twoFactorEnabled: user.twoFactorEnabled,
      emailVerified: user.emailVerified,
    };
  }

  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
    jobTitle?: string;
  }): Promise<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    jobTitle: string | null;
    role: string;
    createdAt: Date;
    twoFactorEnabled: boolean;
    emailVerified: boolean;
  }> {
    const updateData: Partial<schema.User> = {};
    if (data.firstName) updateData.name = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone) updateData.phone = data.phone;
    if (data.avatarUrl) updateData.avatarUrl = data.avatarUrl;
    if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;

    // Mark step 1 complete when phone + name are captured together
    if (data.phone && data.firstName) {
      updateData.onboardingStatus = "step_1_completed";
    }

    const user: schema.User = await this.authRepository.updateUser(userId, updateData);
    if (!user) throw new UnauthorizedException(AUTH_ERRORS.USER_NOT_FOUND);

    // Fire marketing event asynchronously — does not block the response
    if (data.phone && data.firstName) {
      this.eventEmitter.emit("user.lead.captured", {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.name,
      });
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.name,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      jobTitle: user.jobTitle,
      role: user.role,
      createdAt: user.createdAt,
      twoFactorEnabled: user.twoFactorEnabled,
      emailVerified: user.emailVerified,
    };
  }

  async createImpersonationSession(userId: string): Promise<TokenPair> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.USER_NOT_FOUND);
    }

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // Shorter expiry for impersonation? Or keep same.

    await this.authRepository.createSession({
      id: sessionId,
      userId,
      expiresAt,
    });

    return this.generateTokens(userId, user.email, sessionId);
  }

  private generateTokens(
    userId: string,
    email: string,
    sessionId?: string,
  ): Promise<TokenPair> {
    return this.tokenService.generateTokens(userId, email, sessionId);
  }

  handleOAuthLogin(profile: OAuthProfile): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    return this.oauthService.handleOAuthLogin(profile);
  }

  private getSessionExpiry(rememberMe?: boolean): Date {
    return this.tokenService.getSessionExpiry(rememberMe);
  }
}
