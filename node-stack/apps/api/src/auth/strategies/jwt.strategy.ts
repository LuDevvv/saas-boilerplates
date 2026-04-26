import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { schema, eq, DB_TOKEN, type Database } from "@node-stack/db";
import { ExtractJwt, Strategy } from "passport-jwt";

import { TOKEN_TYPE } from "@/auth/constants.js";

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
    const jwtSecret = configService.get("JWT_SECRET");
    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is required");
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const session = await this.db.query.sessions.findFirst({
      where: eq(schema.sessions.id, payload.sessionId),
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException("Session expired or revoked");
    }

    return {
      id: payload.sub,
      email: payload.email,
      sessionId: payload.sessionId,
    };
  }
}
