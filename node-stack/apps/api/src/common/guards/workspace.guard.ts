import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CacheService } from "@node-stack/cache";
import { db, schema, eq, and } from "@node-stack/db";

import { RequestContextService } from "@node-stack/db";

import type { WorkspaceContext } from "../types/index.js";

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private readonly cache: CacheService,
    private readonly contextService: RequestContextService
  ) {}

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

    // Cache workspace existence check (5 min TTL)
    const ws = await this.cache.getOrSet(
      `ws:${workspaceId}:exists`,
      async () => {
        const result = await db.query.workspaces.findFirst({
          where: eq(schema.workspaces.id, workspaceId),
        });
        return result ?? null;
      },
      300,
    );

    if (!ws) {
      throw new NotFoundException("Workspace not found");
    }

    // Cache membership lookup (60s TTL — short to reflect role changes quickly)
    const membership = await this.cache.getOrSet(
      `ws:${workspaceId}:u:${user.id}:member`,
      async () => {
        const result = await db.query.memberships.findFirst({
          where: and(
            eq(schema.memberships.workspaceId, workspaceId),
            eq(schema.memberships.userId, user.id),
          ),
        });
        return result ?? null;
      },
      60,
    );

    if (!membership) {
      throw new ForbiddenException("You are not a member of this workspace");
    }

    if (membership.status !== "active") {
      throw new ForbiddenException("Your membership is not active (pending approval)");
    }

    req.workspace = {
      id: ws.id,
      name: ws.name,
      role: membership.role,
      status: membership.status,
    } as WorkspaceContext;

    // Attach workspace role to user for downstream RBAC guards
    (req.user as any).workspaceRole = membership.role;

    // Set workspace in request context for RLS
    this.contextService.workspaceId = ws.id;
    this.contextService.userId = user.id;

    return true;
  }
}
