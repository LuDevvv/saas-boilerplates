import type { Context } from "hono";
import type { AppContext } from "../../common/types/env";
import { AppError } from "@workspace/types";
import { successResponse } from "../../common/responses";
import { createInvitationService } from "@workspace/services";
import type {
  CreateInvitationInput,
  AcceptInvitationInput,
} from "@workspace/validators";
import { workspaces, createDbClient, eq } from "@workspace/db";
import { createEmailService } from "../../common/services/email.service";

export const InvitationController = {
  /**
   * Invite a new member to the workspace
   */
  async create(c: Context<AppContext>) {
    const body = (await c.req.json()) as CreateInvitationInput;
    const workspaceId = c.get("workspaceId");
    if (!workspaceId) {
      throw new AppError(
        "Workspace context required.",
        400,
        "MISSING_WORKSPACE",
      );
    }

    const user = c.get("user");
    const db = createDbClient(c.env.DATABASE_URL);

    // Fetch only the necessary workspace metadata
    const [ws] = await db
      .select({ name: workspaces.name })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!ws) {
      throw new AppError("Workspace not found.", 404, "NOT_FOUND");
    }

    const email = createEmailService(c.env.EMAIL_QUEUE);
    const service = createInvitationService(db, email, c.env.PUBLIC_APP_URL);
    const invitation = await service.createInvitation(
      user.id,
      user.email,
      workspaceId,
      ws.name,
      body,
    );

    return c.json(successResponse(invitation), 201);
  },

  /**
   * List all pending invitations in workspace
   */
  async list(c: Context<AppContext>) {
    const workspaceId = c.get("workspaceId");
    if (!workspaceId) {
      throw new AppError(
        "Workspace context required.",
        400,
        "MISSING_WORKSPACE",
      );
    }

    const db = createDbClient(c.env.DATABASE_URL);
    const email = createEmailService(c.env.EMAIL_QUEUE);
    const service = createInvitationService(db, email, c.env.PUBLIC_APP_URL);
    const invitations = await service.getWorkspaceInvitations(workspaceId);

    return c.json(successResponse(invitations), 200);
  },

  /**
   * Accept a pending invitation
   */
  async accept(c: Context<AppContext>) {
    const body = (await c.req.json()) as AcceptInvitationInput;
    const user = c.get("user");

    const db = createDbClient(c.env.DATABASE_URL);
    const email = createEmailService(c.env.EMAIL_QUEUE);
    const service = createInvitationService(db, email, c.env.PUBLIC_APP_URL);
    await service.acceptInvitation(user.id, body);

    return c.json(
      successResponse({ message: "Invitation accepted successfully" }),
      200,
    );
  },
};
