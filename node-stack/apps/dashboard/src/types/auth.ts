export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  createdAt: string;
  isEmailVerified?: boolean;
  isTwoFactorEnabled?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface Session {
  id: string;
  userId: string;
  device: string;
  ip: string;
  lastActive: string;
  isCurrent?: boolean;
}

export interface AuthResponse {
  user?: User; // Optional if 2FA is required
  token?: string;
  refreshToken?: string;
  requires2fa?: boolean;
  tempToken?: string;
}

export interface LoginDto {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  email: string;
  password?: string;
  name?: string;
  rememberMe?: boolean;
}

export interface Verify2faDto {
  token: string;
}

export interface Login2faDto {
  tempToken: string;
  token: string;
}

export interface MessageResponse {
  message: string;
}
