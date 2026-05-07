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

export type RefreshDto = any;
export type Verify2faDto = any;
export type Login2faDto = any;
export type RecoveryDto = any;
export type ForgotPasswordDto = any;
export type ResetPasswordDto = any;
export type VerifyEmailDto = any;

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
  subscriptions?: any[];
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
