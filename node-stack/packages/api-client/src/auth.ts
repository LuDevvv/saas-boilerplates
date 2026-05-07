import { AxiosInstance } from "axios";
import { 
  LoginDto, 
  RegisterDto, 
  ForgotPasswordDto, 
  ResetPasswordDto,
  VerifyEmailDto,
  AuthResponse,
  AuthTokens,
  RefreshDto,
  Login2faDto,
  Verify2faDto,
  UpdateProfileDto,
  UserEntity
} from "@node-stack/types";

export const auth = (client: AxiosInstance) => ({
  me: async () => {
    return client.get<UserEntity>("/auth/me") as unknown as Promise<UserEntity>;
  },

  updateProfile: async (data: UpdateProfileDto) => {
    return client.patch<UserEntity>("/auth/profile", data) as unknown as Promise<UserEntity>;
  },

  getSessions: async () => {
    return client.get<any[]>("/auth/sessions") as unknown as Promise<any[]>;
  },

  revokeSession: async (sessionId: string) => {
    await client.delete(`/auth/sessions/${sessionId}`);
  },

  revokeAllSessions: async () => {
    return client.delete<{ count: number }>("/auth/sessions") as unknown as Promise<{ count: number }>;
  },

  enable2fa: async () => {
    return client.post<{ secret: string; otpauthUrl: string }>("/auth/2fa/enable") as unknown as Promise<{ secret: string; otpauthUrl: string }>;
  },

  verify2fa: async (data: Verify2faDto) => {
    return client.post<{ enabled: boolean }>("/auth/2fa/verify", data) as unknown as Promise<{ enabled: boolean }>;
  },

  disable2fa: async () => {
    return client.post<{ disabled: boolean }>("/auth/2fa/disable") as unknown as Promise<{ disabled: boolean }>;
  },

  login2fa: async (data: Login2faDto) => {
    return client.post<AuthResponse>("/auth/2fa/login", data) as unknown as Promise<AuthResponse>;
  },

  login: async (data: LoginDto) => {
    return client.post<AuthResponse>("/auth/login", data) as unknown as Promise<AuthResponse>;
  },

  register: async (data: RegisterDto) => {
    return client.post<AuthResponse>("/auth/register", data) as unknown as Promise<AuthResponse>;
  },

  sendVerificationEmail: async () => {
    return client.post<{ message: string }>("/auth/email/verification-link") as unknown as Promise<{ message: string }>;
  },

  verifyEmail: async (data: VerifyEmailDto) => {
    return client.post<{ message: string }>("/auth/email/verify", data) as unknown as Promise<{ message: string }>;
  },

  forgotPassword: async (data: { email: string }) => {
    return client.post<{ message: string }>("/auth/forgot-password", data) as unknown as Promise<{ message: string }>;
  },

  resetPassword: async (data: ResetPasswordDto) => {
    return client.post<{ message: string }>("/auth/reset-password", data) as unknown as Promise<{ message: string }>;
  },

  logout: async () => {
    return client.post<{ message: string }>("/auth/logout") as unknown as Promise<{ message: string }>;
  },

  refresh: async (data: RefreshDto) => {
    return client.post<AuthTokens>("/auth/refresh", data) as unknown as Promise<AuthTokens>;
  },

  getAuditLogs: async () => {
    return client.get<any[]>("/auth/audit-logs") as unknown as Promise<any[]>;
  },
});
