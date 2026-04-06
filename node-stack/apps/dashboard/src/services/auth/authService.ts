import { apiClient, setToken, removeToken } from "@/lib/api-client";
import type { AuthResponse } from "@/types/auth";

export const authService = {
  checkStatus: async (): Promise<AuthResponse | null> => {
    try {
      const response = await apiClient.auth.login({ email: "", password: "" });
      return response as unknown as AuthResponse;
    } catch {
      return null;
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.auth.login(credentials);
    const data = response.data;
    if (data.accessToken) {
      setToken(data.accessToken);
    }
    return response;
  },

  register: async (userData: { email: string; password: string; firstName?: string }) => {
    const response = await apiClient.auth.register({ 
      email: userData.email, 
      password: userData.password,
      name: userData.firstName 
    });
    const data = response.data;
    if (data.accessToken) {
      setToken(data.accessToken);
    }
    return response;
  },

  logout: async () => {
    try {
      await apiClient.auth.logout();
    } finally {
      removeToken();
    }
  },

  verifyEmail: async (email: string, code: string) => {
    return await apiClient.auth.verifyEmail({ token: code });
  },

  resendVerificationCode: async (email: string) => {
    return await apiClient.auth.forgotPassword({ email });
  },

  requestPasswordReset: async (email: string) => {
    return await apiClient.auth.forgotPassword({ email });
  },

  resetPassword: async (token: string, password?: string) => {
    return await apiClient.auth.resetPassword({ token, password: password || "" });
  },
};