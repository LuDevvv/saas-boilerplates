import * as crypto from "crypto";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { JWT_EXPIRY, TOKEN_TYPE } from "@/auth/constants.js";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

const REMEMBER_ME_DAYS = 90;
const DEFAULT_SESSION_DAYS = 30;

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Sign an access + refresh JWT pair tied to the same `sessionId`.
   * If no sessionId is provided a fresh UUID is generated; the value
   * returned is what the caller should persist on the session row.
   */
  async generateTokens(
    userId: string,
    email: string,
    sessionId?: string,
  ): Promise<TokenPair> {
    const sid = sessionId ?? crypto.randomUUID();
    const accessSecret = this.configService.getOrThrow<string>("JWT_SECRET");
    const refreshSecret =
      this.configService.getOrThrow<string>("JWT_REFRESH_SECRET");

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, type: TOKEN_TYPE.ACCESS, sessionId: sid },
        { secret: accessSecret, expiresIn: JWT_EXPIRY.ACCESS },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, type: TOKEN_TYPE.REFRESH, sessionId: sid },
        { secret: refreshSecret, expiresIn: JWT_EXPIRY.REFRESH },
      ),
    ]);

    return { accessToken, refreshToken, sessionId: sid };
  }

  /**
   * Computes the absolute expiry timestamp for a session row. Uses
   * 90-day rolling windows for "remember me" logins, 30-day windows
   * otherwise — keeping them aligned with JWT_EXPIRY.REFRESH so the
   * session and the refresh token expire together.
   */
  getSessionExpiry(rememberMe?: boolean): Date {
    const days = rememberMe ? REMEMBER_ME_DAYS : DEFAULT_SESSION_DAYS;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }

  /**
   * Verifies a refresh JWT and returns the decoded payload. Throws
   * the underlying JwtService error to the caller — wrappers in
   * SessionService translate to UnauthorizedException with the
   * AUTH_ERRORS.* messages.
   */
  verifyRefreshToken(refreshToken: string): {
    sub: string;
    email: string;
    type: string;
    sessionId: string;
  } {
    const refreshSecret =
      this.configService.getOrThrow<string>("JWT_REFRESH_SECRET");
    return this.jwtService.verify(refreshToken, { secret: refreshSecret });
  }
}
