import * as crypto from "crypto";

import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { CacheService } from "@node-stack/cache";
import {
  AuditLogRepository,
  AuthRepository,
  SessionRepository,
  withSystemTx,
} from "@node-stack/db";
import type { Database } from "@node-stack/db";
import type * as schema from "@node-stack/db/schema";
import { encodeCursor, decodeCursor } from "@node-stack/utils";
import { buildPage, type PaginatedResponse } from "@node-stack/validators";

import { AUTH_ERRORS, TOKEN_TYPE } from "@/auth/constants.js";
import { TokenService, type TokenPair } from "@/auth/services/token.service.js";

export interface SessionListItem {
  id: string;
  userAgent: string;
  ipAddress: string | null;
  lastUsedAt: Date;
  createdAt: Date;
  isCurrent: boolean;
}

interface ListCursor extends Record<string, unknown> {
  createdAt: string;
  id: string;
}

interface ListPageOptions {
  cursor?: string;
  limit?: number;
}

interface FindOrCreateOptions {
  userAgent?: string;
  ipAddress?: string;
  rememberMe?: boolean;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly authRepository: AuthRepository,
    private readonly auditLog: AuditLogRepository,
    private readonly cacheService: CacheService,
    private readonly tokenService: TokenService,
  ) {}

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
    ctx: { ipAddress?: string | null; userAgent?: string | null } = {},
  ): Promise<void> {
    if (sessionId === currentSessionId) {
      throw new BadRequestException(
        "Cannot revoke your current session. Use logout instead.",
      );
    }
    await this.sessionRepository.deleteById(sessionId, userId);
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
          ipAddress: ctx.ipAddress ?? null,
          userAgent: ctx.userAgent ?? null,
        },
        tx,
      );
    }, this.authRepository.db);
  }

  async revokeAllOtherSessions(
    userId: string,
    currentSessionId?: string,
    ctx: { ipAddress?: string | null; userAgent?: string | null } = {},
  ): Promise<{ count: number }> {
    const before = await this.sessionRepository.findActiveByUserId(userId);

    if (currentSessionId && currentSessionId !== "") {
      await this.sessionRepository.deleteAllExcept(userId, currentSessionId);
    } else {
      await this.sessionRepository.deleteAll(userId);
    }

    for (const s of before) {
      if (s.id !== currentSessionId) {
        await this.cacheService.del(`session:${s.id}`);
      }
    }
    const count =
      currentSessionId && currentSessionId !== ""
        ? before.length - 1
        : before.length;

    await withSystemTx(async (tx: Database) => {
      await this.auditLog.create(
        {
          workspaceId: null,
          userId,
          action: "auth.session_revoked_all",
          entityType: "session",
          entityId: null,
          metadata: {
            count,
            keptCurrent: currentSessionId !== undefined && currentSessionId !== "",
          },
          ipAddress: ctx.ipAddress ?? null,
          userAgent: ctx.userAgent ?? null,
        },
        tx,
      );
    }, this.authRepository.db);

    return { count };
  }

  /**
   * Reuses an active session matching the exact userAgent or creates
   * a fresh one. The match-by-userAgent rule prevents row explosion
   * when a user signs in repeatedly from the same browser; an
   * empty/missing userAgent always creates a new row.
   */
  async findOrCreateSession(
    userId: string,
    options: FindOrCreateOptions,
  ): Promise<{ sessionId: string; reused: boolean }> {
    const expiresAt = this.tokenService.getSessionExpiry(options.rememberMe);
    const existing = options.userAgent
      ? await this.authRepository.findActiveSessionByUserAgent(
          userId,
          options.userAgent,
        )
      : undefined;

    if (existing) {
      await this.authRepository.updateSessionActivity(existing.id, {
        lastUsedAt: new Date(),
        expiresAt,
        ipAddress: options.ipAddress,
      });
      return { sessionId: existing.id, reused: true };
    }

    const sessionId = crypto.randomUUID();
    await this.authRepository.createSession({
      id: sessionId,
      userId,
      expiresAt,
      rememberMe: options.rememberMe ?? false,
      userAgent: options.userAgent,
      ipAddress: options.ipAddress,
    });
    return { sessionId, reused: false };
  }

  /**
   * In-place refresh: validates the refresh token, looks up the
   * session, bumps its activity and expiry, then mints a fresh token
   * pair on the same sessionId. The session ID is not rotated —
   * rotation caused races across tabs (one tab deletes the row while
   * another still holds the old refresh token) and orphaned rows
   * when transactions failed mid-rotation.
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    let payload: ReturnType<TokenService["verifyRefreshToken"]>;
    try {
      payload = this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_TOKEN);
    }

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

    const expiresAt = this.tokenService.getSessionExpiry(session.rememberMe);
    await this.authRepository.updateSessionActivity(payload.sessionId, {
      lastUsedAt: new Date(),
      expiresAt,
    });

    return this.tokenService.generateTokens(
      user.id,
      user.email,
      payload.sessionId,
    );
  }
}
