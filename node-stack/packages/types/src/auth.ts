export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

// Placeholder DTO shapes for auth flows whose canonical schema lives
// in @node-stack/validators. Phase 4c (OpenAPI codegen) will replace
// these with the generated types; until then Record<string, unknown>
// keeps the api-client surface lint-clean without claiming a shape.
export type RefreshDto = Record<string, unknown>;
export type Verify2faDto = Record<string, unknown>;
export type Login2faDto = Record<string, unknown>;
export type RecoveryDto = Record<string, unknown>;
export type ForgotPasswordDto = Record<string, unknown>;
export type ResetPasswordDto = Record<string, unknown>;
export type VerifyEmailDto = Record<string, unknown>;

export interface OAuthProfile {
  provider: "google" | "github";
  providerAccountId: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string | null;
}

export interface UserEntity {
  id: string;
  email: string;
  firstName: string | null;
  lastName?: string | null;
  phone: string | null;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  subscriptions?: unknown[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionId?: string;
}

export interface AuthResponse extends AuthTokens {
  user: UserEntity;
  requiresTwoFactor?: boolean;
  tempToken?: string;
}
