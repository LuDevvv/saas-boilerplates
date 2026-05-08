import * as crypto from "crypto";

import { Injectable } from "@nestjs/common";
import { AuthRepository, withSystemTx } from "@node-stack/db";
import type { Database } from "@node-stack/db";
import type { OAuthProfile } from "@node-stack/types";

import { TokenService, type TokenPair } from "@/auth/services/token.service.js";

@Injectable()
export class OAuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Resolves an OAuth callback to a session + token pair.
   *
   * Three paths:
   *   1. The provider/account pair is already linked → reuse the
   *      linked user, refresh the stored access_token.
   *   2. The email matches an existing local user → attach a new
   *      OAuth account row to that user.
   *   3. New email → create the user with emailVerified: true (the
   *      provider already verified it) and attach the OAuth row,
   *      plus emit `user.registered.oauth` to the outbox.
   *
   * Default rememberMe = true: OAuth users typically expect "stay
   * signed in" on the device they consented from.
   */
  handleOAuthLogin(
    profile: OAuthProfile,
  ): Promise<{ accessToken: string; refreshToken: string }> {
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

      const sessionId = crypto.randomUUID();
      const expiresAt = this.tokenService.getSessionExpiry(true);
      await this.authRepository.createSession(
        { id: sessionId, userId, expiresAt, rememberMe: true },
        tx,
      );

      const tokens: TokenPair = await this.tokenService.generateTokens(
        userId,
        userEmail,
        sessionId,
      );
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    }, this.authRepository.db);
  }
}
