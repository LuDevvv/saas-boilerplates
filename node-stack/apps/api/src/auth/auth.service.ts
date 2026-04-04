import * as crypto from "crypto";

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { CacheService } from "@node-stack/cache";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  withTransaction,
  AuthRepository,
  SessionRepository,
} from "@node-stack/db";
import type { Database } from "@node-stack/db";
import { OutboxProducer } from "@node-stack/outbox-queue";
import type { OAuthProfile } from "@node-stack/types";
import * as bcrypt from "bcrypt";

import { TOKEN_TYPE, AUTH_ERRORS, JWT_CONSTANTS } from "./constants";
import type { RegisterDto, LoginDto, RefreshDto } from "./dto";
import { TwoFactorService } from "./two-factor/two-factor.service";

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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private twoFactorService: TwoFactorService,
    private sessionRepository: SessionRepository,
    private authRepository: AuthRepository,
    private cacheService: CacheService,
  ) {}

  async getActiveSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<SessionListItem[]> {
    const sessions = await this.sessionRepository.findActiveByUserId(userId);
    return sessions.map((s) => ({
      id: s.id,
      userAgent: s.userAgent ?? "Unknown device",
      ipAddress: s.ipAddress ?? null,
      lastUsedAt: s.lastUsedAt ?? s.createdAt,
      createdAt: s.createdAt,
      isCurrent: s.id === currentSessionId,
    }));
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
  }

  async revokeAllOtherSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<{ count: number }> {
    const before = await this.sessionRepository.findActiveByUserId(userId);
    await this.sessionRepository.deleteAllExcept(userId, currentSessionId);
    // Clear cache for all revoked sessions
    for (const s of before) {
      if (s.id !== currentSessionId) {
        await this.cacheService.del(`session:${s.id}`);
      }
    }
    return { count: before.length - 1 };
  }

  async register(
    dto: RegisterDto,
  ): Promise<
    TokenPair & { user: { id: string; email: string; name: string | null } }
  > {
    // Hash password outside the transaction (CPU-bound, no DB dependency)
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const sessionId = crypto.randomUUID();

    // All DB operations inside a single transaction to prevent TOCTOU race conditions.
    // The email uniqueness check MUST be inside the tx so two concurrent registrations
    // cannot both pass the check before either insert completes.
    let outboxEventId: string | null = null;
    const user = await withTransaction(async (tx) => {
      // Check for existing user INSIDE the transaction
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
          name: dto.name,
        },
        tx,
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await this.authRepository.createSession(
        { id: sessionId, userId: newUser.id, expiresAt },
        tx,
      );

      outboxEventId = await this.authRepository.createOutboxEvent(
        "user.registered",
        { userId: newUser.id, email: newUser.email },
        tx,
      );

      return newUser;
    });

    // Trigger background processing for the outbox event after commit
    if (outboxEventId) {
      await OutboxProducer.addProcessOutboxJob(outboxEventId);
    }

    const tokens = await this.generateTokens(user.id, user.email, sessionId);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(
    dto: LoginDto,
  ): Promise<
    | (TokenPair & { user: { id: string; email: string; name: string | null } })
    | { requires2FA: true; tempToken: string }
  > {
    const user = await this.validateUser(dto.email.toLowerCase(), dto.password);

    const fullUser = await this.authRepository.findUserById(user.id);

    if (fullUser?.twoFactorEnabled) {
      const tempToken = this.twoFactorService.generateTempToken(user.id);
      return { requires2FA: true, tempToken };
    }

    const sessionId = crypto.randomUUID();
    const tokens = await this.generateTokens(user.id, user.email, sessionId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.authRepository.createSession({
      id: sessionId,
      userId: user.id,
      expiresAt,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: fullUser?.name ?? null,
      },
    };
  }

  async refresh(dto: RefreshDto): Promise<TokenPair> {
    const refreshSecret =
      this.configService.get("JWT_REFRESH_SECRET") ||
      this.configService.get("JWT_SECRET") ||
      JWT_CONSTANTS.REFRESH_SECRET;

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

      const newSessionId = crypto.randomUUID();
      const tokens = await this.generateTokens(
        user.id,
        user.email,
        newSessionId,
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await withTransaction(async (tx) => {
        await this.authRepository.rotateSession(
          payload.sessionId,
          { id: newSessionId, userId: user.id, expiresAt },
          tx,
        );
      });

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_TOKEN);
    }
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
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
    sessionId?: string,
  ): Promise<TokenPair> {
    const sid = sessionId || crypto.randomUUID();
    const accessSecret =
      this.configService.get("JWT_SECRET") || JWT_CONSTANTS.ACCESS_SECRET;
    const refreshSecret =
      this.configService.get("JWT_REFRESH_SECRET") ||
      this.configService.get("JWT_SECRET") ||
      JWT_CONSTANTS.REFRESH_SECRET;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, type: TOKEN_TYPE.ACCESS, sessionId: sid },
        {
          secret: accessSecret,
          expiresIn: JWT_CONSTANTS.ACCESS_EXPIRY,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, type: TOKEN_TYPE.REFRESH, sessionId: sid },
        {
          secret: refreshSecret,
          expiresIn: JWT_CONSTANTS.REFRESH_EXPIRY,
        },
      ),
    ]);

    return { accessToken, refreshToken, sessionId: sid };
  }

  async handleOAuthLogin(profile: OAuthProfile): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    return withTransaction(async (tx) => {
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
              name: profile.name,
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
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await this.authRepository.createSession(
        { id: sessionId, userId, expiresAt },
        tx,
      );

      return this.generateTokens(userId, userEmail, sessionId);
    });
  }
}
