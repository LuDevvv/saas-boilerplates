import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { OAuthProfile } from "@node-stack/types";
import { Strategy, Profile } from "passport-github2";

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, "github") {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow("GITHUB_CLIENT_ID"),
      clientSecret: config.getOrThrow("GITHUB_CLIENT_SECRET"),
      callbackURL: config.getOrThrow("GITHUB_CALLBACK_URL"),
      scope: ["user:email"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<OAuthProfile> {
    let email = profile.emails?.[0]?.value;
    if (!email) {
      const res = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      });
      if (res.ok) {
        const list = (await res.json()) as Array<{
          email: string;
          primary: boolean;
          verified: boolean;
        }>;
        email = list.find((e) => e.primary && e.verified)?.email;
      }
    }
    if (!email)
      throw new UnauthorizedException(
        "GitHub account has no verified public email",
      );
    return {
      provider: "github",
      providerAccountId: String(profile.id),
      email: email.toLowerCase(),
      name: profile.displayName ?? profile.username ?? email,
      accessToken,
      refreshToken: refreshToken ?? null,
    };
  }
}
