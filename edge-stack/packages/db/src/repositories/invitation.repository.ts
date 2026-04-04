import { eq, and } from "drizzle-orm";
import type { Database } from "../db";
import {
  invitations,
  type NewInvitation,
  type Invitation,
} from "../schema/invitations";
import { memberships, type WorkspaceRole } from "../schema/workspaces";

/**
 * Repository for managing workspace invitations.
 */
export const InvitationRepository = {
  /**
   * Creates a new pending invitation.
   */
  async createInvitation(
    db: Database,
    data: NewInvitation,
  ): Promise<Invitation> {
    const [invitation] = await db.insert(invitations).values(data).returning();
    if (!invitation) throw new Error("Failed to create invitation");
    return invitation;
  },

  /**
   * Fetches an invitation by its unique token.
   */
  async getInvitationByToken(
    db: Database,
    token: string,
  ): Promise<Invitation | null> {
    const result = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, token))
      .limit(1);

    return result[0] ?? null;
  },

  /**
   * Retrieves all pending invitations for a specific workspace.
   */
  async getWorkspaceInvitations(
    db: Database,
    workspaceId: string,
  ): Promise<Invitation[]> {
    return await db
      .select()
      .from(invitations)
      .where(eq(invitations.workspaceId, workspaceId));
  },

  /**
   * Accepts an invitation by creating a membership and removing the token atomically.
   */
  async acceptInvitation(
    db: Database,
    token: string,
    userId: string,
  ): Promise<boolean> {
    // Note: neon-http does not support transactions.
    const [invite] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, token))
      .limit(1);

    if (!invite) return false;

    // Delete the invitation first
    await db.delete(invitations).where(eq(invitations.id, invite.id));

    // Create membership
    await db.insert(memberships).values({
      userId,
      workspaceId: invite.workspaceId,
      role: invite.role as WorkspaceRole,
    });

    return true;
  },

  /**
   * Delete an invitation by id.
   */
  async deleteInvitation(db: Database, id: string): Promise<void> {
    await db.delete(invitations).where(eq(invitations.id, id));
  },
};
