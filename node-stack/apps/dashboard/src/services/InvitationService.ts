import { BaseService } from "./baseService";

export interface InvitationDetails {
  workspaceName: string;
  inviterName: string;
  role: string;
  expiresAt: string;
}

export interface AcceptResult {
  success: boolean;
  message: string;
  workspaceId: string;
  role: string;
}

class InvitationService extends BaseService {
  constructor() {
    super("/workspace-invitations");
  }

  /**
   * Get invitation metadata for the landing page
   */
  async getDetails(token: string): Promise<InvitationDetails> {
    // If using mocks, we point to the mock JSON
    if (this.useMocks) {
      return this.get<InvitationDetails>("/", "invitation-details.json");
    }

    return this.get<InvitationDetails>(`/${token}`);
  }

  /**
   * Accept the invitation (requires auth)
   */
  async accept(token: string): Promise<AcceptResult> {
    if (this.useMocks) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        message: "Invitation accepted (MOCK)",
        workspaceId: "mock-workspace-id",
        role: "admin"
      };
    }

    return this.post<AcceptResult>(`/${token}/accept`, {});
  }
}

export const invitationService = new InvitationService();
