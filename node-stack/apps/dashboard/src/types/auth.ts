export enum Role {
  SUPERADMIN = "SUPERADMIN",
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

/**
 * Generic User interface for the universal dashboard.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  lastName?: string;
  username?: string;
  profilePicture?: {
    url: string;
  };
  role: Role | string; // Global role
  isEmailVerified: boolean;
  isActive?: boolean;
  phone?: string | number;
  provider?: "local" | "google" | "github";
  createdAt: Date;
  updatedAt: Date;
  memberships?: WorkspaceMembership[];
}

export interface WorkspaceMembership {
  workspaceId: string;
  role: Role | string;
}

/**
 * Generic Workspace/Company interface.
 */
export interface Workspace {
  id: string;
  name: string;
  logo?: string;
  role: Role | string; // User role in this workspace
}

/**
 * Auth response structure.
 */
export interface AuthResponse {
  user: User;
  token: string;
  requiresVerification?: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
  lastName?: string;
}

export interface VerifyEmailParams {
  email: string;
  code: string;
}

export interface ResetPasswordParams {
  token: string;
  password?: string;
}
