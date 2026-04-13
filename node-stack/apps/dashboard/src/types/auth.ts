export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  createdAt: string;
  isEmailVerified?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface Session {
  user: User;
  workspace?: Workspace;
  token: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginDto {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterDto extends LoginDto {
  name: string;
}

export interface MessageResponse {
  message: string;
}
