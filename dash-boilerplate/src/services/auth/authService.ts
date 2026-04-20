import { apiClient } from "@/lib/api-client";
import { BaseService } from "../BaseService";
import { 
  LoginDto, 
  RegisterDto, 
  AuthResponse, 
  MessageResponse 
} from "@/types/auth";

class AuthService extends BaseService {
  constructor() {
    super("auth");
  }

  async checkStatus(): Promise<AuthResponse | null> {
    try {
      return await this.handleRequest<AuthResponse>(
        () => apiClient.get("/auth/status"),
        "user"
      );
    } catch (error) {
      return null;
    }
  }

  async login(credentials: LoginDto): Promise<AuthResponse> {
    return this.handleRequest<AuthResponse>(
      () => apiClient.post("/auth/login", credentials),
      "user"
    );
  }

  async register(userData: RegisterDto): Promise<AuthResponse> {
    return this.handleRequest<AuthResponse>(
      () => apiClient.post("/auth/register", userData),
      "user"
    );
  }

  async logout(): Promise<void> {
    // In a boilerplate, logout might just be local
    // but we support server-side if provided
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      // Ignore if server logout fails
    }
  }

  async requestPasswordReset(email: string): Promise<MessageResponse> {
    return this.handleRequest<MessageResponse>(
      () => apiClient.post("/auth/forgot-password", { email }),
      "message"
    );
  }

  async resetPassword(token: string, password: string): Promise<MessageResponse> {
    return this.handleRequest<MessageResponse>(
      () => apiClient.post("/auth/reset-password", { token, password }),
      "message"
    );
  }

  async loginWithGoogle(): Promise<void> {
    const googleAuthUrl = `${apiClient.defaults.baseURL}/auth/google`;
    window.location.href = googleAuthUrl;
  }

  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    return this.handleRequest<AuthResponse>(
      () => apiClient.post("/auth/verify-email", { email, code }),
      "user"
    );
  }

  async resendVerificationCode(email: string): Promise<MessageResponse> {
    return this.handleRequest<MessageResponse>(
      () => apiClient.post("/auth/resend-verification", { email }),
      "message"
    );
  }
}

export const authService = new AuthService();
