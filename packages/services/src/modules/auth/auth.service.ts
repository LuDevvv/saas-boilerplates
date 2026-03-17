import {
  type Database,
  UserRepository,
  SessionRepository,
  TokenRepository,
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
import type { InternalProfile } from "./oauth.service";
import type { TfaService } from "./2fa.service";

/**
 * Service for handling authentication logic.
 * Orchestrates credential validation, token issuance, and background tasks.
 * Decoupled from the HTTP layer and infrastructure implementations.
 */
export const createAuthService = (
  db: Database,
  queue: IQueueService,
  jwt: IJwtService,
  tfa: TfaService,
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

  return {
    /**
     * Registers a new user.
     */
    register: async (data: RegisterInput): Promise<AuthSuccessData> => {
      const existingUser = await UserRepository.findByEmail(db, data.email);
      if (existingUser) {
        throw new AppError(
          "Email address is already registered.",
          400,
          "EMAIL_EXISTS",
        );
      }

      const passwordHash = await hashPassword(data.password);

      const { user, refreshToken, token } = await db.transaction(
        async (tx: Database) => {
        const user = await UserRepository.create(tx, {
          email: data.email,
          name: data.name,
          passwordHash,
          emailVerified: false,
        });

        // Access Token (1 hour) - Signed outside if static, but usually sub depends on user.id
        const token = await jwt.signToken({
          sub: user.id,
          email: user.email,
          role: user.role,
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        });

        // Refresh Token (30 days) - Created inside transaction
        const refreshToken = await createSession(user.id, tx);

        return { user, refreshToken, token };
      });

      await queue.enqueueWelcomeEmail({
        email: user.email,
        name: user.name ?? "New User",
      });

      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name ?? "New User",
          role: user.role,
        },
      };
    },

    /**
     * Authenticates a user.
     */
    login: async (data: LoginInput): Promise<AuthSuccessData> => {
      const user = await UserRepository.findByEmail(db, data.email);

      if (!user || !user.passwordHash) {
        throw new AppError(
          "Invalid email or password.",
          401,
          "INVALID_CREDENTIALS",
        );
      }

      const isValid = await verifyPassword(data.password, user.passwordHash);
      if (!isValid) {
        throw new AppError(
          "Invalid email or password.",
          401,
          "INVALID_CREDENTIALS",
        );
      }

      if (user.twoFactorEnabled) {
        const token = await jwt.signToken({
          sub: user.id,
          pending2fa: true,
          exp: Math.floor(Date.now() / 1000) + 60 * 15,
        });
        return { token, pending2fa: true };
      }

      // Access Token (1 hour)
      const token = await jwt.signToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      });

      // Refresh Token (30 days)
      const refreshToken = await createSession(user.id);

      return {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name ?? "User",
          role: user.role,
        },
      };
    },

    /**
     * Orchestrates Social OAuth verification.
     */
    socialLogin: async (
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

        const existingAccount = existingAccounts[0];

        if (existingAccount) {
          if (existingAccount.userId !== targetUser.id) {
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

        if (targetUser.twoFactorEnabled) {
          const token = await jwt.signToken({
            sub: targetUser.id,
            pending2fa: true,
            exp: Math.floor(Date.now() / 1000) + 60 * 15,
          });
          return { token, pending2fa: true };
        }

        // Access Token (1 hour)
        const token = await jwt.signToken({
          sub: targetUser.id,
          email: targetUser.email,
          role: targetUser.role,
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        });

        // Refresh Token (30 days)
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
    },

    /**
     * Renews an access token using a valid refresh token.
     * Implements rotation: old refresh token is invalidated, new one is issued.
     */
    refresh: async (
      oldRefreshToken: string,
    ): Promise<{ token: string; refreshToken: string }> => {
      const session = await SessionRepository.findValid(db, oldRefreshToken);
      if (!session) {
        throw new AppError(
          "Invalid or expired refresh token.",
          401,
          "INVALID_SESSION",
        );
      }

      const user = await UserRepository.findById(db, session.userId);
      if (!user) {
        throw new AppError("User not found.", 404, "NOT_FOUND");
      }

      // Rotate session atomically
      const { token, refreshToken } = await db.transaction(
        async (tx: Database) => {
          // Invalidate old session (Rotation)
          await SessionRepository.delete(tx, oldRefreshToken);

          // New Access Token
          const token = await jwt.signToken({
            sub: user.id,
            email: user.email,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
          });

          // New Refresh Token
          const refreshToken = await createSession(user.id, tx);

          return { token, refreshToken };
        },
      );

      return { token, refreshToken };
    },

    setup2fa: async (userId: string) => {
      const user = await UserRepository.findById(db, userId);
      if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
      if (user.twoFactorEnabled)
        throw new AppError("2FA already enabled", 400, "ALREADY_ENABLED");

      const { secret, uri } = tfa.generateSecret(user.email);
      await UserRepository.update(db, userId, { twoFactorSecret: secret });

      return { secret, uri };
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

    verify2fa: async (
      userId: string,
      token?: string,
      recoveryCode?: string,
    ): Promise<AuthSuccessData> => {
      const user = await UserRepository.findById(db, userId);
      if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new AppError(
          "2FA is not enabled for this user",
          400,
          "NOT_ENABLED",
        );
      }

      const { sessionToken, refreshToken } = await db.transaction(
        async (tx: Database) => {
          let isValid = false;
          if (token) {
            isValid = tfa.verifyToken(user.twoFactorSecret!, token);
          } else if (recoveryCode) {
            const codes = user.twoFactorRecoveryCodes || [];
            if (codes.includes(recoveryCode)) {
              isValid = true;
              const newCodes = codes.filter((c) => c !== recoveryCode);
              await UserRepository.update(tx, userId, {
                twoFactorRecoveryCodes: newCodes,
              });
            }
          }

          if (!isValid) {
            throw new AppError(
              "Invalid 2FA code or recovery code",
              401,
              "INVALID_CODE",
            );
          }

          const sessionToken = await jwt.signToken({
            sub: user.id,
            email: user.email,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
          });

          const refreshToken = await createSession(user.id, tx);

          return { sessionToken, refreshToken };
        },
      );

      return {
        token: sessionToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name ?? "User",
          role: user.role,
        },
      };
    },

    /**
     * Initiates the password recovery flow.
     * Generates a secure token stored in the database and sends an email.
     */
    requestPasswordReset: async (email: string): Promise<void> => {
      const user = await UserRepository.findByEmail(db, email);
      if (!user) {
        // Return success even if user not found for security (prevent email enumeration)
        return;
      }

      const token = generateRandomString(48);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

      await TokenRepository.create(db, {
        userId: user.id,
        token,
        type: "password_reset",
        expiresAt,
      });

      await queue.enqueuePasswordResetEmail({
        email,
        token,
      });
    },

    /**
     * Completes the password recovery flow.
     * Consumes the reset token and updates the user's password.
     */
    resetPassword: async (
      token: string,
      newPassword: string,
    ): Promise<void> => {
      const passwordHash = await hashPassword(newPassword);

      await db.transaction(async (tx: Database) => {
        const consumedToken = await TokenRepository.validateAndConsume(
          tx,
          token,
          "password_reset",
        );

        if (!consumedToken) {
          throw new AppError(
            "Invalid or expired reset token.",
            400,
            "INVALID_TOKEN",
          );
        }

        await UserRepository.update(tx, consumedToken.userId, {
          passwordHash,
        });
      });
    },

    unlinkAccount: async (userId: string, provider: string): Promise<void> => {
      const user = await UserRepository.findById(db, userId);
      if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

      const userAccounts = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, userId));

      const hasPassword = Boolean(user.passwordHash);
      const otherAccounts = userAccounts.filter(
        (a: any) => a.provider !== provider,
      );

      if (!hasPassword && otherAccounts.length === 0) {
        throw new AppError(
          "Cannot unlink the only authentication method.",
          400,
          "CANNOT_UNLINK_SOLE_LOGIN",
        );
      }

      await db
        .delete(accounts)
        .where(
          and(eq(accounts.userId, userId), eq(accounts.provider, provider)),
        );
    },
  };
};
