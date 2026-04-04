import { eq, and, sql, inArray } from "drizzle-orm";
import type { Database } from "../db";
import {
  workspaces,
  memberships,
  type Workspace,
  type NewWorkspace,
  type Membership,
} from "../schema/workspaces";
import { users } from "../schema/users";

/**
 * Repository for Workspace-related database operations.
 * Handles multi-tenant organization management and memberships.
 */
export const WorkspaceRepository = {
  /**
   * Creates a new workspace and automatically assigns the creator as the 'owner'.
   * Executed within a manual transaction context if provided by the caller.
   *
   * @param db - Database instance
   * @param userId - ID of the user creating the workspace
   * @param data - Workspace creation data
   */
  async createWorkspace(
    db: Database,
    userId: string,
    data: NewWorkspace,
  ): Promise<{ workspace: Workspace; membership: Membership }> {
    return await db.transaction(async (tx: Database) => {
      const [workspace] = await tx.insert(workspaces).values(data).returning();
      if (!workspace) throw new Error("Failed to create workspace");

      const [membership] = await tx
        .insert(memberships)
        .values({
          userId,
          workspaceId: workspace.id,
          role: "owner",
        })
        .returning();

      if (!membership) {
        throw new Error("Failed to create initial membership");
      }

      return { workspace, membership };
    });
  },

  /**
   * Retrieves all workspaces where the user is a member.
   * @param db - Database instance
   * @param userId - ID of the user
   */
  async getUserWorkspaces(
    db: Database,
    userId: string,
  ): Promise<(Workspace & { role: string })[]> {
    const results = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        slug: workspaces.slug,
        logoUrl: workspaces.logoUrl,
        createdAt: workspaces.createdAt,
        updatedAt: workspaces.updatedAt,
        role: memberships.role,
      })
      .from(workspaces)
      .innerJoin(memberships, eq(memberships.workspaceId, workspaces.id))
      .where(eq(memberships.userId, userId));

    return results;
  },

  /**
   * Retrieves all members of a specific workspace.
   * @param db - Database instance
   * @param workspaceId - ID of the workspace
   */
  async getWorkspaceMembers(db: Database, workspaceId: string) {
    return await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: memberships.role,
        createdAt: memberships.createdAt,
      })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .where(eq(memberships.workspaceId, workspaceId));
  },

  /**
   * Finds a single membership record for a user in a specific workspace.
   */
  async getMembership(
    db: Database,
    userId: string,
    workspaceId: string,
  ): Promise<Membership | null> {
    const result = await db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, userId),
          eq(memberships.workspaceId, workspaceId),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  },

  /**
   * Updates an existing workspace.
   */
  async updateWorkspace(
    db: Database,
    workspaceId: string,
    data: Partial<NewWorkspace>,
  ): Promise<Workspace | null> {
    try {
      console.log(
        `[WorkspaceRepository] Updating workspace ${workspaceId}`,
        data,
      );

      const [workspace] = await db
        .update(workspaces)
        .set({
          ...(data.name ? { name: data.name } : {}),
          ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
          updatedAt: sql`now()`,
        })
        .where(eq(workspaces.id, workspaceId))
        .returning();

      return workspace ?? null;
    } catch (error) {
      console.error(
        `[WorkspaceRepository] Update failed for ${workspaceId}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Removes a user from a workspace by deleting their membership.
   */
  async removeMember(
    db: Database,
    workspaceId: string,
    userId: string,
    actorRole: string,
  ): Promise<boolean> {
    // Seniority check: Admins can only remove members. Owners can remove admins and members.
    // Owners cannot remove themselves via this path (usually handled via 'delete workspace' or 'transfer ownership').
    const allowedTargetRoles: string[] =
      actorRole === "owner" ? ["admin", "member"] : ["member"];

    const result = await db
      .delete(memberships)
      .where(
        and(
          eq(memberships.workspaceId, workspaceId),
          eq(memberships.userId, userId),
          inArray(memberships.role, allowedTargetRoles as any),
        ),
      )
      .returning();

    return result.length > 0;
  },

  /**
   * Updates the role of a member within a workspace.
   */
  async updateMemberRole(
    db: Database,
    workspaceId: string,
    userId: string,
    newRole: string,
    actorRole: string,
  ): Promise<boolean> {
    // Seniority check:
    // 1. Only owners can promote anyone to 'owner' or 'admin'.
    // 2. Admins can only promote 'member' to 'admin' (maybe?) or just 'member' to 'member' (useless).
    // Usually: Only owners can change roles to/from 'admin' or 'owner'.
    if (actorRole !== "owner" && (newRole === "owner" || newRole === "admin")) {
      return false;
    }

    const allowedTargetRoles: string[] =
      actorRole === "owner" ? ["admin", "member"] : ["member"];

    const result = await db
      .update(memberships)
      .set({
        role: newRole as any,
      })
      .where(
        and(
          eq(memberships.workspaceId, workspaceId),
          eq(memberships.userId, userId),
          inArray(memberships.role, allowedTargetRoles as any),
        ),
      )
      .returning();

    return result.length > 0;
  },
};
