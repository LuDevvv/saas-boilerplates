import {
  type Database,
  UserRepository,
  SessionRepository,
  TokenRepository,
  OutboxRepository,
  accounts,
  eq,
  and,
} from "@workspace/db";
import { AppError } from "@workspace/types";
import {
  type RegisterInput,
  type LoginInput,
  type AuthSuccessData,
} from "@workspace/validators";
import {
  hashPassword,
  verifyPassword,
  generateRandomString,
} from "../../common/crypto";
import type { IQueueService, IJwtService } from "../../common/interfaces";
import { OAuthService, type InternalProfile, type OAuthConfig } from "./oauth.service";
import type { TfaService } from "./2fa.service";

/**
 * Inferred type from the AuthService factory.
 */
export type AuthService = ReturnType<typeof createAuthService>;

/**
 * Service for handling authentication logic.
 * Orchestrates credential validation, token issuance, and background tasks.
 */
export const createAuthService = (
  db: Database,
  queue: IQueueService,
  jwt: IJwtService,
  tfa: TfaService,
  config?: OAuthConfig,
) => {
  /**
   * Internal helper to create a session and return a refresh token.
   */
  const createSession = async (
    userId: string,
    client: Database = db,
  ): Promise<string> => {
    const id = generateRandomString(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await SessionRepository.create(client, {
      id,
      userId,
      expiresAt,
    });

    return id;
  };

  const socialLogin = async (
    provider: string,
    profile: InternalProfile,
    authenticatedUserId?: string,
  ): Promise<AuthSuccessData> => {
    return await db.transaction(async (tx: Database) => {
      let targetUser = null;

      if (authenticatedUserId) {
        targetUser = await UserRepository.findById(tx, authenticatedUserId);
        if (!targetUser) {
          throw new AppError("Authenticated user not found.", 404, "NOT_FOUND");
        }
      } else {
        let user = await UserRepository.findByEmail(tx, profile.email);
        if (!user) {
          user = await UserRepository.create(tx, {
            email: profile.email,
            name: profile.name,
            avatarUrl: profile.avatarUrl,
            passwordHash: null,
            emailVerified: true,
          });
        } else if (!user.avatarUrl && profile.avatarUrl) {
          await UserRepository.update(tx, user.id, {
            avatarUrl: profile.avatarUrl,
          });
        }
        targetUser = user;
      }

      const existingAccounts = await tx
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.provider, provider),
            eq(accounts.providerAccountId, profile.id),
          ),
        )
        .limit(1);

      if (existingAccounts[0]) {
        if (existingAccounts[0].userId !== targetUser.id) {
          throw new AppError(
            "This social account is already linked to another user.",
            400,
            "ACCOUNT_LINKED_ELSEWHERE",
          );
        }
      } else {
        await tx.insert(accounts).values({
          userId: targetUser.id,
          provider,
          providerAccountId: profile.id,
        });
      }

      const token = await jwt.signToken({
        sub: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      });

      const refreshToken = await createSession(targetUser.id, tx);

      return {
        token,
        refreshToken,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          name: targetUser.name ?? "User",
          role: targetUser.role,
        },
      };
    });
  };

  return {
    register: async (data: RegisterInput): Promise<AuthSuccessData> => {
      const existingUser = await UserRepository.findByEmail(db, data.email);
      if (existingUser) {
        throw new AppError("Email exists", 400, "EMAIL_EXISTS");
      }
      const passwordHash = await hashPassword(data.password);
      return await db.transaction(async (tx: Database) => {
        const user = await UserRepository.create(tx, {
          email: data.email,
          name: data.name,
          passwordHash,
          emailVerified: false,
        });
        const token = await jwt.signToken({ sub: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now()/1000)+3600 });
        const refreshToken = await createSession(user.id, tx);
        await OutboxRepository.createEvent(tx, { eventType: "email.welcome", payload: { email: user.email, name: user.name ?? "User" } });
        return { token, refreshToken, user: { id: user.id, email: user.email, name: user.name ?? "User", role: user.role } };
      });
    },

    login: async (data: LoginInput): Promise<AuthSuccessData> => {
      const user = await UserRepository.findByEmail(db, data.email);
      if (!user || !user.passwordHash || !(await verifyPassword(data.password, user.passwordHash))) {
        throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
      }
      if (user.twoFactorEnabled) {
        const token = await jwt.signToken({ sub: user.id, pending2fa: true, exp: Math.floor(Date.now()/1000)+900 });
        return { token, pending2fa: true };
      }
      const token = await jwt.signToken({ sub: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now()/1000)+3600 });
      const refreshToken = await createSession(user.id);
      return { token, refreshToken, user: { id: user.id, email: user.email, name: user.name ?? "User", role: user.role } };
    },

    logout: async (refreshToken: string) => {
      await SessionRepository.delete(db, refreshToken);
    },

    getMe: async (userId: string) => {
      const user = await UserRepository.findById(db, userId);
      if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
      };
    },

    getSessions: async (userId: string, currentSessionId: string) => {
      const sessions = await SessionRepository.findByUserId(db, userId);
      return sessions.map((s) => ({
        id: s.id,
        expiresAt: s.expiresAt,
        isCurrent: s.id === currentSessionId,
      }));
    },

    revokeSession: async (userId: string, sessionId: string, currentSessionId: string) => {
      if (sessionId === currentSessionId) {
        throw new AppError("Cannot revoke current session. Use logout.", 400, "BAD_REQUEST");
      }
      await SessionRepository.deleteUserSession(db, userId, sessionId);
    },

    revokeAllOtherSessions: async (userId: string, currentSessionId: string) => {
      await SessionRepository.deleteAllExcept(db, userId, currentSessionId);
    },

    refresh: async (oldRefreshToken: string) => {
      const session = await SessionRepository.findValid(db, oldRefreshToken);
      if (!session) throw new AppError("Invalid session", 401, "INVALID_SESSION");
      const user = await UserRepository.findById(db, session.userId);
      if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
      return await db.transaction(async (tx: Database) => {
        await SessionRepository.delete(tx, oldRefreshToken);
        const token = await jwt.signToken({ sub: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now()/1000)+3600 });
        const refreshToken = await createSession(user.id, tx);
        return { token, refreshToken };
      });
    },

    socialLogin,
    loginWithOAuth: socialLogin,

    setup2fa: async (userId: string) => {
      const user = await UserRepository.findById(db, userId);
      if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
      const { secret, uri } = tfa.generateSecret(user.email);
      await UserRepository.update(db, userId, { twoFactorSecret: secret });
      return { secret, uri };
    },

    verify2fa: async (pendingToken: string, code: string): Promise<AuthSuccessData> => {
      const payload = await jwt.verifyToken(pendingToken) as any;
      if (!payload.pending2fa) throw new AppError("Invalid token", 401, "INVALID_TOKEN");
      const user = await UserRepository.findById(db, payload.sub);
      if (!user || !user.twoFactorSecret || !tfa.verifyToken(user.twoFactorSecret, code)) {
        throw new AppError("Invalid code", 401, "INVALID_CODE");
      }
      const token = await jwt.signToken({ sub: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now()/1000)+3600 });
      const refreshToken = await createSession(user.id);
      return { token, refreshToken, user: { id: user.id, email: user.email, name: user.name ?? "User", role: user.role } };
    },

    enable2fa: async (userId: string, token: string) => {
      const user = await UserRepository.findById(db, userId);
      if (!user || !user.twoFactorSecret)
        throw new AppError("Setup 2FA first", 400, "SETUP_REQUIRED");
      if (user.twoFactorEnabled)
        throw new AppError("2FA already enabled", 400, "ALREADY_ENABLED");

      const isValid = tfa.verifyToken(user.twoFactorSecret, token);
      if (!isValid)
        throw new AppError("Invalid verification code", 400, "INVALID_CODE");

      const recoveryCodes = tfa.generateRecoveryCodes();
      await UserRepository.update(db, userId, {
        twoFactorEnabled: true,
        twoFactorRecoveryCodes: recoveryCodes,
      });

      return { recoveryCodes };
    },

    /**
     * Initiates the password recovery flow.
     */
    requestPasswordReset: async (email: string): Promise<void> => {
      const user = await UserRepository.findByEmail(db, email);
      if (!user) return;

      const token = generateRandomString(48);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await db.transaction(async (tx: Database) => {
        await TokenRepository.create(tx, {
          userId: user.id,
          token,
          type: "password_reset",
          expiresAt,
        });

        await OutboxRepository.createEvent(tx, {
          eventType: "email.password_reset",
          payload: { email, token },
        });
      });
    },

    /**
     * Completes the password recovery flow.
     */
    resetPassword: async (token: string, newPassword: string): Promise<void> => {
      const passwordHash = await hashPassword(newPassword);
      await db.transaction(async (tx: Database) => {
        const consumedToken = await TokenRepository.validateAndConsume(
          tx,
          token,
          "password_reset",
        );
        if (!consumedToken) {
          throw new AppError("Invalid or expired token", 400, "INVALID_TOKEN");
        }
        await UserRepository.update(tx, consumedToken.userId, { passwordHash });
      });
    },

    /**
     * Reliable background processor for the transactional outbox.
     */
    processOutbox: async (): Promise<void> => {
      const events = await OutboxRepository.getPendingEvents(db, 20);

      for (const event of events) {
        try {
          switch (event.eventType) {
            case "email.welcome":
              await queue.enqueueWelcomeEmail(event.payload as any);
              break;
            case "email.password_reset":
              await queue.enqueuePasswordResetEmail(event.payload as any);
              break;
            default:
              console.warn(`[Outbox] Unknown event type: ${event.eventType}`);
          }

          await OutboxRepository.markAsProcessed(db, event.id);
        } catch (error) {
          console.error(`[Outbox] Failed to process event ${event.id}:`, error);
        }
      }
    },

    toggle2fa: async (userId: string, enabled: boolean) => {
      await UserRepository.update(db, userId, { twoFactorEnabled: enabled });
    },

    unlinkAccount: async (userId: string, provider: string) => {
      await db
        .delete(accounts)
        .where(
          and(eq(accounts.userId, userId), eq(accounts.provider, provider)),
        );
    },

    unlinkProvider: async (userId: string, provider: string) => {
      await db
        .delete(accounts)
        .where(
          and(eq(accounts.userId, userId), eq(accounts.provider, provider)),
        );
    },
  };
};
