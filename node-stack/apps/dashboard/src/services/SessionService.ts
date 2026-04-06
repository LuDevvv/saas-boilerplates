import { BaseService } from "./baseService";

export interface Session {
  id: string;
  isCurrent: boolean;
  device: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  version: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  createdAt: string;
}

/**
 * Service to manage active user sessions (devices/browsers).
 * Connects to the /auth/sessions backend endpoints.
 */
class SessionService extends BaseService {
  constructor() {
    super("/auth");
  }

  /**
   * Retrieves all active sessions for the current user.
   */
  async listActiveSessions(): Promise<Session[]> {
    if (this.useMocks) {
      return this.getMockData<Session[]>("sessions.json");
    }

    return this.get<Session[]>("/sessions");
  }

  /**
   * Revoke a specific session by ID.
   * Note: Revoking the current session should be handled by the normal logout flow.
   */
  async revokeSession(sessionId: string): Promise<void> {
    if (this.useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }

    return this.delete(`/sessions/${sessionId}`);
  }

  /**
   * Security reset: revokes all other sessions except the current one.
   */
  async revokeAllExceptCurrent(): Promise<{ count: number }> {
    if (this.useMocks) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { count: 2 };
    }

    return this.delete("/sessions");
  }
}

export const sessionService = new SessionService();
