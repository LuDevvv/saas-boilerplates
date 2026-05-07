import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { CacheService } from "@node-stack/cache";
import {
  schema,
  eq,
  DB_TOKEN,
  AuthRepository,
  AuditLogRepository,
  withSystemTx,
} from "@node-stack/db";
import type { Database } from "@node-stack/db";
import { OTP } from "otplib";
import * as QRCode from "qrcode";

import { TOKEN_TYPE, JWT_EXPIRY } from "@/auth/constants.js";
import { TotpSecretCipher } from "@/auth/two-factor/totp-secret-cipher.js";

// Replay window: a TOTP code is valid for 30s ±30s (epochTolerance), so we
// hold the "used" marker for 95s — long enough that the attacker cannot
// replay a sniffed code while it is still inside its real validity window.
const TOTP_REPLAY_TTL_SECONDS = 95;

@Injectable()
export class TwoFactorService {
  private readonly otp = new OTP();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(DB_TOKEN) private readonly db: Database,
    private readonly authRepository: AuthRepository,
    private readonly auditLog: AuditLogRepository,
    private readonly totpCipher: TotpSecretCipher,
    private readonly cache: CacheService,
  ) { }

  async generateSecret(
    userId: string,
  ): Promise<{ qrCodeUrl: string; secret: string; otpAuthUrl: string }> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const secret = this.otp.generateSecret();
    const appName = this.configService.get("APP_NAME", "NodeStack");

    const otpAuthUrl = this.otp.generateURI({
      issuer: appName,
      label: `${appName}:${user.email}`,
      secret,
    });

    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);

    await this.db
      .update(schema.users)
      .set({ twoFactorSecret: this.totpCipher.encrypt(secret) })
      .where(eq(schema.users.id, userId));

    return { qrCodeUrl, secret, otpAuthUrl };
  }

  async verifyToken(
    userId: string,
    secret: string,
    token: string,
  ): Promise<boolean> {
    try {
      const cleanToken = String(token).replace(/\s+/g, "");
      const replayKey = `2fa:used:${userId}:${cleanToken}`;

      // Fail closed if the same code was already accepted within its
      // validity window — prevents shoulder-surf replay attacks.
      const alreadyUsed = await this.cache.get(replayKey);
      if (alreadyUsed !== null) {
        return false;
      }

      const result = await this.otp.verify({
        secret,
        token: cleanToken,
        epochTolerance: 30, // Account for clock drift
      });

      if (result.valid) {
        await this.cache.set(replayKey, 1, TOTP_REPLAY_TTL_SECONDS);
      }

      return result.valid;
    } catch (error) {
      return false;
    }
  }

  async enableTwoFactor(userId: string, token: string): Promise<void> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException(
        "Generate a 2FA secret first by calling /v1/auth/2fa/generate",
      );
    }

    const isValid = await this.verifyToken(
      userId,
      this.totpCipher.decrypt(user.twoFactorSecret),
      token,
    );

    if (!isValid) {
      throw new UnauthorizedException("Invalid 2FA token");
    }

    await this.db
      .update(schema.users)
      .set({ twoFactorEnabled: true })
      .where(eq(schema.users.id, userId));

    await withSystemTx(async (tx) => {
      await this.auditLog.create(
        {
          workspaceId: null,
          userId,
          action: "auth.two_factor_enabled",
          entityType: "user",
          entityId: userId,
          metadata: {},
        },
        tx,
      );
    }, this.db);
  }

  async disableTwoFactor(userId: string): Promise<void> {
    await this.db
      .update(schema.users)
      .set({ twoFactorEnabled: false, twoFactorSecret: null })
      .where(eq(schema.users.id, userId));

    await withSystemTx(async (tx) => {
      await this.auditLog.create(
        {
          workspaceId: null,
          userId,
          action: "auth.two_factor_disabled",
          entityType: "user",
          entityId: userId,
          metadata: {},
        },
        tx,
      );
    }, this.db);
  }

  async verifyLoginToken(
    userId: string,
    token: string,
    rememberMe?: boolean,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException("2FA is not enabled for this user");
    }

    const isValid = await this.verifyToken(
      user.id,
      this.totpCipher.decrypt(user.twoFactorSecret),
      token,
    );

    if (!isValid) {
      throw new UnauthorizedException("Invalid 2FA token");
    }

    const expiresAt = new Date();
    const sessionDays = rememberMe ? 90 : 30;
    expiresAt.setDate(expiresAt.getDate() + sessionDays);

    // Reuse an active session for the same device (matched by exact userAgent)
    // to avoid creating a new session row for every 2FA login.
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
      sessionId = (crypto as any).randomUUID();
      await this.authRepository.createSession({
        id: sessionId,
        userId: user.id,
        expiresAt,
        rememberMe: rememberMe ?? false,
        userAgent,
        ipAddress,
      });
    }

    const accessSecret = this.configService.getOrThrow<string>("JWT_SECRET");
    const refreshSecret = this.configService.getOrThrow<string>(
      "JWT_REFRESH_SECRET",
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: user.id, email: user.email, type: TOKEN_TYPE.ACCESS, sessionId },
        { secret: accessSecret, expiresIn: JWT_EXPIRY.ACCESS },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          type: TOKEN_TYPE.REFRESH,
          sessionId,
        },
        { secret: refreshSecret, expiresIn: JWT_EXPIRY.REFRESH },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  generateTempToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: "2fa_pending" },
      {
        secret: this.configService.getOrThrow<string>("JWT_SECRET"),
        expiresIn: "5m",
      },
    );
  }

  verifyTempToken(token: string): string {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow<string>("JWT_SECRET"),
      });

      if (payload.type !== "2fa_pending") {
        throw new UnauthorizedException("Invalid temporary token");
      }

      return payload.sub;
    } catch {
      throw new UnauthorizedException("Invalid or expired temporary token");
    }
  }
}