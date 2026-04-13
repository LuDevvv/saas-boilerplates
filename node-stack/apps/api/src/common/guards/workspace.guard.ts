import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { db, schema, eq, and } from "@node-stack/db";

import type { WorkspaceContext } from "../types";

@Injectable()
export class WorkspaceGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as any;
    // Extract workspace ID: Look for explicit workspaceId param first,
    // otherwise fallback to id only if the request concerns workspaces context.
    const workspaceId: string =
      req?.params?.workspaceId ||
      (req?.params?.id &&
        (req?.url?.includes("/workspaces") ||
          req?.url?.includes("/api-keys") ||
          req?.url?.includes("/storage") ||
          req?.url?.includes("/ai"))
        ? req.params.id
        : undefined);

    const user = req?.user;

    // Skip workspace check if no relevant workspaceId param is found
    if (!workspaceId) {
      return true;
    }
    if (!user?.id) {
      throw new ForbiddenException("Authentication required");
    }

    const ws = await db.query.workspaces.findFirst({
      where: eq(schema.workspaces.id, workspaceId),
    });
    if (!ws) {
      throw new NotFoundException("Workspace not found");
    }

    const membership = await db.query.memberships.findFirst({
      where: and(
        eq(schema.memberships.workspaceId, workspaceId),
        eq(schema.memberships.userId, user.id),
      ),
    });

    if (!membership) {
      throw new ForbiddenException("You are not a member of this workspace");
    }

    req.workspace = {
      id: ws.id,
      name: ws.name,
      role: membership.role,
    } as WorkspaceContext;

    // Attach workspace role to user for downstream RBAC guards
    (req.user as any).workspaceRole = membership.role;

    return true;
  }
}
