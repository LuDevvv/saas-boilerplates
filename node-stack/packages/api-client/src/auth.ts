import { AxiosInstance } from "axios";
import { createClient, AuthTokens } from "./client.js";
import { LoginSchema, RegisterSchema, RefreshSchema, Verify2faSchema, Login2faSchema, ForgotPasswordSchema, ResetPasswordSchema } from "@node-stack/validators";

export interface LoginResponse extends AuthTokens {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  requiresTwoFactor?: boolean;
  tempToken?: string;
}

export interface RegisterResponse extends AuthTokens {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface VerifyEmailResponse {
  verified: boolean;
  message: string;
}

export interface ForgotPasswordResponse {
  sent: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface RefreshResponse extends AuthTokens {}

export interface LogoutResponse {
  success: boolean;
}

export const auth = (client: AxiosInstance) => ({
  login: async (body: { email: string; password: string }) => {
    return await client.post<LoginResponse>("/auth/login", LoginSchema.parse(body));
  },

  register: async (body: { email: string; password: string; name?: string }) => {
    return await client.post<RegisterResponse>("/auth/register", RegisterSchema.parse(body));
  },

  verifyEmail: async (body: { token: string }) => {
    return await client.post<VerifyEmailResponse>("/auth/verify-email", { token: body.token });
  },

  forgotPassword: async (body: { email: string }) => {
    return await client.post<ForgotPasswordResponse>("/auth/forgot-password", ForgotPasswordSchema.parse(body));
  },

  resetPassword: async (body: { token: string; password: string }) => {
    return await client.post<ResetPasswordResponse>("/auth/reset-password", ResetPasswordSchema.parse(body));
  },

  verify2fa: async (body: { token: string }) => {
    return await client.post<LoginResponse>("/auth/verify-2fa", Verify2faSchema.parse(body));
  },

  login2fa: async (body: { tempToken: string; token: string }) => {
    return await client.post<LoginResponse>("/auth/login-2fa", Login2faSchema.parse(body));
  },

  refresh: async (body: { refreshToken: string }) => {
    return await client.post<RefreshResponse>("/auth/refresh", RefreshSchema.parse(body));
  },

  logout: async () => {
    return await client.post<LogoutResponse>("/auth/logout");
  },
});
