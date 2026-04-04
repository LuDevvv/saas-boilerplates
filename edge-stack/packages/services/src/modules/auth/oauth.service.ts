export interface InternalProfile {
  id: string; // provider account id
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface OAuthConfig {
  googleClientId: string;
  googleClientSecret: string;
  facebookAppId: string;
  facebookAppSecret: string;
  githubClientId: string;
  githubClientSecret: string;
}

export class OAuthService {
  constructor(private config: OAuthConfig) {}

  /**
   * Generate Google Authorization URL
   */
  getGoogleAuthUrl(state: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: this.config.googleClientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "consent",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Generate Facebook Authorization URL
   */
  getFacebookAuthUrl(state: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: this.config.facebookAppId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "email public_profile",
      state,
    });
    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  /**
   * Generate GitHub Authorization URL
   */
  getGithubAuthUrl(state: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: this.config.githubClientId,
      redirect_uri: redirectUri,
      scope: "user:email",
      state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange Google Code for Profile
   */
  async verifyGoogleCode(
    code: string,
    redirectUri: string,
  ): Promise<InternalProfile> {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.config.googleClientId,
        client_secret: this.config.googleClientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Google token exchange failed: ${err}`);
    }

    const tokenData = (await tokenRes.json()) as {
      access_token: string;
      id_token: string;
    };

    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    if (!profileRes.ok) {
      const err = await profileRes.text();
      throw new Error(`Google profile fetch failed: ${err}`);
    }

    const profile = (await profileRes.json()) as any;

    return {
      id: profile.sub,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
    };
  }

  /**
   * Exchange Facebook Code for Profile
   */
  async verifyFacebookCode(
    code: string,
    redirectUri: string,
  ): Promise<InternalProfile> {
    const tokenParams = new URLSearchParams({
      client_id: this.config.facebookAppId,
      client_secret: this.config.facebookAppSecret,
      redirect_uri: redirectUri,
      code,
    });
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?${tokenParams.toString()}`,
    );

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Facebook token exchange failed: ${err}`);
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };

    const profileRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${tokenData.access_token}`,
    );

    if (!profileRes.ok) {
      const err = await profileRes.text();
      throw new Error(`Facebook profile fetch failed: ${err}`);
    }

    const profile = (await profileRes.json()) as any;

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture?.data?.url,
    };
  }

  /**
   * Exchange GitHub Code for Profile
   */
  async verifyGithubCode(
    code: string,
    redirectUri: string,
  ): Promise<InternalProfile> {
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: this.config.githubClientId,
          client_secret: this.config.githubClientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      },
    );

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`GitHub token exchange failed: ${err}`);
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };

    const profileRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${tokenData.access_token}`,
        "User-Agent": "Azteli-SaaS-Template",
      },
    });

    if (!profileRes.ok) {
      const err = await profileRes.text();
      throw new Error(`GitHub profile fetch failed: ${err}`);
    }

    const profile = (await profileRes.json()) as any;

    // GitHub users might not have a public email, fetch emails separately
    let email = profile.email;
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${tokenData.access_token}`,
          "User-Agent": "Azteli-SaaS-Template",
        },
      });
      if (emailRes.ok) {
        const emails = (await emailRes.json()) as any[];
        const primary = emails.find((e) => e.primary && e.verified);
        email = primary ? primary.email : emails[0]?.email;
      }
    }

    return {
      id: profile.id.toString(),
      email,
      name: profile.name || profile.login,
      avatarUrl: profile.avatar_url,
    };
  }

  /**
   * Generic profile fetcher for any supported provider.
   */
  async getUserProfile(
    provider: "google" | "facebook" | "github",
    code: string,
    redirectUri: string,
  ): Promise<InternalProfile> {
    switch (provider) {
      case "google":
        return this.verifyGoogleCode(code, redirectUri);
      case "facebook":
        return this.verifyFacebookCode(code, redirectUri);
      case "github":
        return this.verifyGithubCode(code, redirectUri);
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }
}
