import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { OAuthProfile } from "@node-stack/types";
import { Strategy, Profile } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow("GOOGLE_CLIENT_ID"),
      clientSecret: config.getOrThrow("GOOGLE_CLIENT_SECRET"),
      callbackURL: config.getOrThrow("GOOGLE_CALLBACK_URL"),
      scope: ["email", "profile"],
      state: true,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<OAuthProfile> {
    const email = profile.emails?.[0]?.value;
    if (!email)
      throw new UnauthorizedException("Google account has no email");
    return {
      provider: "google",
      providerAccountId: profile.id,
      email: email.toLowerCase(),
      name: profile.displayName ?? email,
      accessToken,
      refreshToken: refreshToken ?? null,
    };
  }
}
