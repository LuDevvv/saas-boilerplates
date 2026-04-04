export interface OAuthProfile {
  provider: "google" | "github";
  providerAccountId: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string | null;
}
