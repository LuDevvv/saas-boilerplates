import { type Database, InvitationRepository } from "@workspace/db";
import { AppError } from "@workspace/types";
import {
  type CreateInvitationInput,
  type AcceptInvitationInput,
} from "@workspace/validators";
import type { IEmailService } from "../../common/interfaces";

/**
 * Service for managing workspace invitations.
 */
export const createInvitationService = (
  db: Database,
  email: IEmailService,
  publicAppUrl: string,
) => {
  return {
    /**
     * Creates an invitation, generates token, saves to DB, sends email.
     */
    createInvitation: async (
      inviterId: string,
      inviterEmail: string,
      workspaceId: string,
      workspaceName: string,
      data: CreateInvitationInput,
    ) => {
      // Generate token (simple random hex or UUID)
      const token =
        crypto.randomUUID().replace(/-/g, "") +
        crypto.randomUUID().replace(/-/g, "");

      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Save to DB
      const invitation = await InvitationRepository.createInvitation(db, {
        workspaceId,
        email: data.email,
        role: data.role as any,
        token,
        expiresAt,
        invitedBy: inviterId,
      });

      // Send Email using the injected service
      const inviteLink = `${publicAppUrl}/invites?token=${token}`;
      await email.sendTeamInviteEmail(
        data.email,
        inviterEmail,
        workspaceName,
        inviteLink,
      );

      return invitation;
    },

    /**
     * Accepts an invitation, consumes token, adds membership.
     */
    acceptInvitation: async (userId: string, data: AcceptInvitationInput) => {
      const invitation = await InvitationRepository.getInvitationByToken(
        db,
        data.token,
      );
      if (!invitation) {
        throw new AppError(
          "Invalid or expired invitation token.",
          400,
          "INVALID_TOKEN",
        );
      }

      if (invitation.expiresAt < new Date()) {
        // Keep DB clean
        await InvitationRepository.deleteInvitation(db, invitation.id);
        throw new AppError("Invitation has expired.", 400, "EXPIRED_TOKEN");
      }

      const success = await InvitationRepository.acceptInvitation(
        db,
        data.token,
        userId,
      );
      if (!success) {
        throw new AppError(
          "Failed to accept invitation.",
          500,
          "ACCEPT_FAILED",
        );
      }

      return true;
    },

    getWorkspaceInvitations: async (workspaceId: string) => {
      return await InvitationRepository.getWorkspaceInvitations(
        db,
        workspaceId,
      );
    },
  };
};

export type InvitationService = ReturnType<typeof createInvitationService>;
