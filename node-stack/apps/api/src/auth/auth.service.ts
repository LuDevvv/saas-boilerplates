import * as crypto from "crypto";

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { CacheService } from "@node-stack/cache";
import {
  withSystemTx,
  AuthRepository,
  AuditLogRepository,
  SessionRepository,
} from "@node-stack/db";
import type { Database } from "@node-stack/db";
import * as schema from "@node-stack/db/schema";
import { OutboxProducer } from "@node-stack/outbox-queue";
import type { OAuthProfile } from "@node-stack/types";
import { encodeCursor, decodeCursor } from "@node-stack/utils";
import { buildPage, type PaginatedResponse } from "@node-stack/validators";
import * as bcrypt from "bcrypt";

import { TOKEN_TYPE, AUTH_ERRORS, JWT_EXPIRY } from "@/auth/constants.js";
import type { RegisterDto, LoginDto, RefreshDto } from "@/auth/dto/index.js";
import { TwoFactorService } from "@/auth/two-factor/two-factor.service.js";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export interface SessionListItem {
  id: string;
  userAgent: string;
  ipAddress: string | null;
  lastUsedAt: Date;
  createdAt: Date;
  isCurrent: boolean;
}

export interface ValidateUserResult {
  id: string;
  email: string;
  passwordHash: string;
}

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
    private jwtService: JwtService,
    private configService: ConfigService,
    private twoFactorService: TwoFactorService,
    private sessionRepository: SessionRepository,
    private authRepository: AuthRepository,
    private auditLog: AuditLogRepository,
    private cacheService: CacheService,
  ) { }

  async getActiveSessions(
    userId: string,
    currentSessionId: string,
    options: ListPageOptions = {},
  ): Promise<PaginatedResponse<SessionListItem>> {
    const limit = options.limit ?? 20;
    const cursor = options.cursor
      ? decodeCursor<ListCursor>(options.cursor)
      : null;

    const rows = await this.sessionRepository.findActiveByUserIdPaged(userId, {
      limit: limit + 1,
      cursorCreatedAt: cursor ? new Date(cursor.createdAt) : null,
      cursorId: cursor?.id ?? null,
    });

    const mapped: SessionListItem[] = rows.map(
      (s: typeof schema.sessions.$inferSelect) => ({
        id: s.id,
        userAgent: s.userAgent ?? "Unknown device",
        ipAddress: s.ipAddress ?? null,
        lastUsedAt: s.lastUsedAt ?? s.createdAt,
        createdAt: s.createdAt,
        isCurrent: s.id === currentSessionId,
      }),
    );

    return buildPage(mapped, limit, (item) =>
      encodeCursor({ createdAt: item.createdAt.toISOString(), id: item.id }),
    );
  }

  async revokeSession(
    sessionId: string,
    userId: string,
    currentSessionId: string,
  ): Promise<void> {
    if (sessionId === currentSessionId) {
      throw new BadRequestException(
        "Cannot revoke your current session. Use logout instead.",
      );
    }
    await this.sessionRepository.deleteById(sessionId, userId);
    // Invalidate cache for this user's session
    await this.cacheService.del(`session:${sessionId}`);

    await withSystemTx(async (tx: Database) => {
      await this.auditLog.create(
        {
          workspaceId: null,
          userId,
          action: "auth.session_revoked",
          entityType: "session",
          entityId: sessionId,
          metadata: {},
        },
        tx,
      );
    }, this.authRepository.db);
  }

  async revokeAllOtherSessions(
    userId: string,
    currentSessionId?: string,
  ): Promise<{ count: number }> {
    const before = await this.sessionRepository.findActiveByUserId(userId);

    if (currentSessionId && currentSessionId !== "") {
      await this.sessionRepository.deleteAllExcept(userId, currentSessionId);
    } else {
      await this.sessionRepository.deleteAll(userId);
    }

    // Clear cache for all revoked sessions
    for (const s of before) {
      if (s.id !== currentSessionId) {
        await this.cacheService.del(`session:${s.id}`);
      }
    }
    const count = (currentSessionId && currentSessionId !== "") ? before.length - 1 : before.length;

    await withSystemTx(async (tx: Database) => {
      await this.auditLog.create(
        {
          workspaceId: null,
          userId,
          action: "auth.session_revoked_all",
          entityType: "session",
          entityId: null,
          metadata: { count, keptCurrent: currentSessionId !== undefined && currentSessionId !== "" },
        },
        tx,
      );
    }, this.authRepository.db);

    return { count };
  }

  async register(
    dto: RegisterDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<
    TokenPair & { token: string; user: { id: string; email: string; firstName: string | null; lastName: string | null; phone: string | null } }
  > {
    const passwordHash = await bcrypt.hash(dto.password, 12);
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
      user = await this.validateUser(dto.email.toLowerCase(), dto.password);
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

    const expiresAt = this.getSessionExpiry(dto.rememberMe);

    // Reuse an active session for the same device (matched by exact userAgent)
    // to prevent session proliferation when users log in repeatedly from the
    // same browser. An empty/missing userAgent is treated as a new device.
    const existingSession = userAgent
      ? await this.authRepository.findActiveSessionByUserAgent(user.id, userAgent)
      : undefined;

    let sessionId: string;
    if (existingSession) {
      sessionId = existingSession.id;
      await this.authRepository.updateSessionActivity(sessionId, {
        lastUsedAt: new Date(),
        expiresAt,
        ipAddress,
      });
    } else {
      sessionId = crypto.randomUUID();
      await this.authRepository.createSession({
        id: sessionId,
        userId: user.id,
        expiresAt,
        rememberMe: dto.rememberMe ?? false,
        userAgent,
        ipAddress,
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, sessionId);

    await withSystemTx(async (tx: Database) => {
      await this.auditLog.create(
        {
          workspaceId: null,
          userId: user.id,
          action: "auth.login_succeeded",
          entityType: "session",
          entityId: sessionId,
          metadata: { reused: existingSession !== undefined },
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

  async refresh(dto: RefreshDto): Promise<TokenPair> {
    const refreshSecret = this.configService.getOrThrow<string>("JWT_REFRESH_SECRET");

    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: refreshSecret,
      });

      if (payload.type !== TOKEN_TYPE.REFRESH) {
        throw new UnauthorizedException(AUTH_ERRORS.INVALID_TOKEN);
      }

      const session = await this.authRepository.findActiveSessionById(
        payload.sessionId,
      );

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException(AUTH_ERRORS.TOKEN_EXPIRED);
      }

      const user = await this.authRepository.findUserById(payload.sub);

      if (!user) {
        throw new UnauthorizedException(AUTH_ERRORS.USER_NOT_FOUND);
      }

      // Refresh updates the session in-place rather than rotating the ID:
      // rotating caused race conditions across tabs (one tab deletes the row
      // while another still holds the old refresh token) and orphaned rows
      // when transactions failed mid-rotation.
      const expiresAt = this.getSessionExpiry(session.rememberMe);

      await this.authRepository.updateSessionActivity(payload.sessionId, {
        lastUsedAt: new Date(),
        expiresAt,
      });

      const tokens = await this.generateTokens(
        user.id,
        user.email,
        payload.sessionId,
      );

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_TOKEN);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.authRepository.findUserByEmail(email.toLowerCase());
    if (!user) return; // Silent return for security

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    let outboxEventId: string | null = null;
    await withSystemTx(async (tx: Database) => {
      // Invalidate any previous reset tokens for this user
      await this.authRepository.deleteVerificationTokensByUser(user.id, "password_reset", tx);

      await this.authRepository.createVerificationToken({
        identifier: "password_reset",
        token,
        expiresAt,
        userId: user.id,
      }, tx);

      outboxEventId = await this.authRepository.createOutboxEvent(
        "user.forgot_password",
        { userId: user.id, email: user.email, token },
        tx
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

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const verification = await this.authRepository.findVerificationToken("password_reset", token);

    if (!verification || verification.expiresAt < new Date()) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await withSystemTx(async (tx: Database) => {
      await this.authRepository.updateUser(verification.userId, { passwordHash }, tx);
      await this.authRepository.deleteVerificationToken(token, tx);

      await this.authRepository.createOutboxEvent(
        "user.password_changed",
        { userId: verification.userId },
        tx
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

    // Revoke all active sessions for security
    await this.revokeAllOtherSessions(verification.userId, "");
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

  async getUserById(userId: string) {
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
      role: user.role,
      createdAt: user.createdAt,
      twoFactorEnabled: user.twoFactorEnabled,
      emailVerified: user.emailVerified,
    };
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }) {
    const updateData: Partial<schema.User> = {};
    if (data.firstName) {
      updateData.name = data.firstName;
    }
    if (data.lastName !== undefined) {
      updateData.lastName = data.lastName;
    }
    if (data.phone) {
      updateData.phone = data.phone;
    }
    if (data.avatarUrl) {
      updateData.avatarUrl = data.avatarUrl;
    }

    // Update user profile in repository
    const user: schema.User = await this.authRepository.updateUser(userId, updateData);
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

  private async generateTokens(
    userId: string,
    email: string,
    sessionId?: string,
  ): Promise<TokenPair> {
    const sid = sessionId || crypto.randomUUID();
    const accessSecret = this.configService.getOrThrow<string>("JWT_SECRET");
    const refreshSecret = this.configService.getOrThrow<string>("JWT_REFRESH_SECRET");

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, type: TOKEN_TYPE.ACCESS, sessionId: sid },
        {
          secret: accessSecret,
          expiresIn: JWT_EXPIRY.ACCESS,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, type: TOKEN_TYPE.REFRESH, sessionId: sid },
        {
          secret: refreshSecret,
          expiresIn: JWT_EXPIRY.REFRESH,
        },
      ),
    ]);

    return { accessToken, refreshToken, sessionId: sid };
  }

  async handleOAuthLogin(profile: OAuthProfile): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    return withSystemTx(async (tx: Database) => {
      const existingLink = await this.authRepository.findOAuthLink(
        profile.provider,
        profile.providerAccountId,
        tx,
      );

      let userId: string;
      let userEmail: string;

      if (existingLink) {
        await this.authRepository.updateOAuthAccessToken(
          existingLink.id,
          profile.accessToken ?? "",
          tx,
        );
        userId = existingLink.userId;
        const existingUser = await this.authRepository.findUserById(userId, tx);
        userEmail = existingUser?.email ?? profile.email;
      } else {
        const existingUser = await this.authRepository.findUserByEmail(
          profile.email,
          tx,
        );
        if (existingUser) {
          await this.authRepository.createOAuthAccount(
            {
              userId: existingUser.id,
              provider: profile.provider,
              providerAccountId: profile.providerAccountId,
              accessToken: profile.accessToken,
              refreshToken: profile.refreshToken,
            },
            tx,
          );
          userId = existingUser.id;
          userEmail = existingUser.email;
        } else {
          const newUser = await this.authRepository.createUser(
            {
              email: profile.email,
              name: profile.name, // OAuth still uses 'name' as a single string usually
              emailVerified: true,
            },
            tx,
          );
          await this.authRepository.createOAuthAccount(
            {
              userId: newUser.id,
              provider: profile.provider,
              providerAccountId: profile.providerAccountId,
              accessToken: profile.accessToken,
              refreshToken: profile.refreshToken,
            },
            tx,
          );
          await this.authRepository.createOutboxEvent(
            "user.registered.oauth",
            { userId: newUser.id, provider: profile.provider },
            tx,
          );
          userId = newUser.id;
          userEmail = newUser.email;
        }
      }

      // Create session inside the transaction
      const sessionId = crypto.randomUUID();
      const expiresAt = this.getSessionExpiry(true); // Default OAuth to remember for UX
      await this.authRepository.createSession(
        { id: sessionId, userId, expiresAt, rememberMe: true },
        tx,
      );

      return this.generateTokens(userId, userEmail, sessionId);
    }, this.authRepository.db);
  }

  private getSessionExpiry(rememberMe?: boolean): Date {
    const days = rememberMe ? 90 : 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }
}
