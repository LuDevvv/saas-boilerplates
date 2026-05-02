import { apiClient } from "@/lib/api";
import type { LoginDto, RegisterDto, User } from "@node-stack/types";
import type { AuthResponse } from "./types";

export const authApi = {
  checkStatus: (): Promise<{ user: User; token?: string }> => 
    apiClient.get("/auth/me"),

  login: (credentials: LoginDto): Promise<AuthResponse> => 
    apiClient.post("/auth/login", credentials),

  register: (userData: RegisterDto): Promise<AuthResponse> => 
    apiClient.post("/auth/register", userData),

  logout: (): Promise<void> => 
    apiClient.post("/auth/logout"),

  requestPasswordReset: (email: string): Promise<void> => 
    apiClient.post("/auth/request-password-reset", { email }),

  resetPassword: (token: string, password: string): Promise<void> => 
    apiClient.post("/auth/reset-password", { token, password }),

  updateProfile: (data: { firstName: string; lastName: string }): Promise<User> =>
    apiClient.patch("/auth/profile", data),

  verifyEmail: (email: string, code: string): Promise<void> =>
    apiClient.post("/auth/verify-email", { email, code }),

  resendVerificationCode: (email: string): Promise<void> =>
    apiClient.post("/auth/resend-verification", { email }),
};
