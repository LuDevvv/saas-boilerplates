import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { schema, eq, and, isNull, DB_TOKEN, type Database } from "@node-stack/db";
import { ExtractJwt, Strategy } from "passport-jwt";

import { AUTH_ERRORS, TOKEN_TYPE } from "@/auth/constants.js";

export interface JwtPayload {
  sub: string;
  email: string;
  type: typeof TOKEN_TYPE.ACCESS;
  sessionId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    configService: ConfigService,
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload): Promise<{ id: string; email: string; sessionId: string; role: string }> {
    const session = await this.db.query.sessions.findFirst({
      where: eq(schema.sessions.id, payload.sessionId),
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException("Session expired or revoked");
    }

    // Defense-in-depth: AccountService.closeAccount hard-deletes
    // sessions on close, so a soft-deleted user shouldn't make it
    // past the session check above. This is the second line — if
    // any session somehow survives (race, manual DB tweak, restored
    // session), the JWT itself stops working here.
    const user = await this.db.query.users.findFirst({
      where: and(eq(schema.users.id, payload.sub), isNull(schema.users.deletedAt)),
    });
    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    return {
      id: payload.sub,
      email: payload.email,
      sessionId: payload.sessionId,
      role: user.role,
    };
  }
}
