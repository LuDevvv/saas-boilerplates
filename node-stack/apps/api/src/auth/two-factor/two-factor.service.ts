import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { db, schema, eq } from "@node-stack/db";
import { OTP } from "otplib";
import * as QRCode from "qrcode";

import { TOKEN_TYPE, JWT_CONSTANTS } from "@/auth/constants.js";

@Injectable()
export class TwoFactorService {
  private readonly otp = new OTP();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async generateSecret(
    userId: string,
  ): Promise<{ qrCodeUrl: string; secret: string }> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const secret = this.otp.generateSecret();
    const appName = this.configService.get("APP_NAME", "NodeStack");

    const otpAuthUrl = this.otp.generateURI({
      issuer: appName,
      label: user.email,
      secret,
    });

    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);

    await db
      .update(schema.users)
      .set({ twoFactorSecret: secret })
      .where(eq(schema.users.id, userId));

    return { qrCodeUrl, secret };
  }

  async verifyToken(secret: string, token: string): Promise<boolean> {
    try {
      const cleanToken = String(token).replace(/\s+/g, "");

      const result = await this.otp.verify({
        secret,
        token: cleanToken,
        epochTolerance: 30, // Account for clock drift
      });

      return result.valid;
    } catch (error) {
      return false;
    }
  }

  async enableTwoFactor(userId: string, token: string): Promise<void> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException(
        "Generate a 2FA secret first by calling /v1/auth/2fa/generate",
      );
    }

    const isValid = await this.verifyToken(user.twoFactorSecret, token);

    if (!isValid) {
      throw new UnauthorizedException("Invalid 2FA token");
    }

    await db
      .update(schema.users)
      .set({ twoFactorEnabled: true })
      .where(eq(schema.users.id, userId));
  }

  async disableTwoFactor(userId: string): Promise<void> {
    await db
      .update(schema.users)
      .set({ twoFactorEnabled: false, twoFactorSecret: null })
      .where(eq(schema.users.id, userId));
  }

  async verifyLoginToken(
    userId: string,
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException("2FA is not enabled for this user");
    }

    const isValid = await this.verifyToken(user.twoFactorSecret, token);

    if (!isValid) {
      throw new UnauthorizedException("Invalid 2FA token");
    }

    const sessionId = (crypto as any).randomUUID();
    const accessSecret = this.configService.get("JWT_SECRET");
    const refreshSecret =
      this.configService.get("JWT_REFRESH_SECRET") ||
      this.configService.get("JWT_SECRET");

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: user.id, email: user.email, type: TOKEN_TYPE.ACCESS, sessionId },
        { secret: accessSecret, expiresIn: JWT_CONSTANTS.ACCESS_EXPIRY },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          type: TOKEN_TYPE.REFRESH,
          sessionId,
        },
        { secret: refreshSecret, expiresIn: JWT_CONSTANTS.REFRESH_EXPIRY },
      ),
    ]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(schema.sessions).values({
      id: sessionId,
      userId: user.id,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  generateTempToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: "2fa_pending" },
      {
        secret: this.configService.get("JWT_SECRET"),
        expiresIn: "5m",
      },
    );
  }

  verifyTempToken(token: string): string {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get("JWT_SECRET"),
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