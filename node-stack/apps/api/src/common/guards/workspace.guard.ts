import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CacheService } from "@node-stack/cache";
import { schema, eq, and, DB_TOKEN, RequestContextService } from "@node-stack/db";
import type { Database } from "@node-stack/db";
import type { Request } from "express";

import { IS_PUBLIC_KEY } from "@/common/decorators/public.decorator.js";
import type { WorkspaceContext } from "@/common/types/index.js";

interface WorkspaceRequest extends Request {
  user?: { id?: string; workspaceRole?: string };
  workspace?: WorkspaceContext;
  tenantId?: string;
}

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cache: CacheService,
    private readonly contextService: RequestContextService,
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<WorkspaceRequest>();

    // Extract workspace ID: Look for explicit workspaceId param first,
    // then headers (x-workspace-id or x-tenant-id), then fallback to id
    // only if the request context suggests a workspace-related resource.
    const params = req.params ?? {};
    const headers = req.headers ?? {};

    const firstHeader = (v: string | string[] | undefined): string | undefined =>
      Array.isArray(v) ? v[0] : v;
    const workspaceId: string | undefined =
      (params["workspaceId"] as string | undefined) ??
      firstHeader(headers["x-workspace-id"]) ??
      firstHeader(headers["x-tenant-id"]) ??
      ((params["id"] as string | undefined) &&
        (req.url.includes("/workspaces") ||
          req.url.includes("/api-keys") ||
          req.url.includes("/storage") ||
          req.url.includes("/ai") ||
          req.url.includes("/billing") ||
          req.url.includes("/portability"))
        ? (params["id"] as string)
        : undefined);

    const user = req.user;

    // Skip workspace check if no workspaceId is found (allows public/non-workspace routes)
    if (!workspaceId) {
      // If the route belongs to a workspace-dependent domain, require the ID
      const isWorkspaceDomain =
        req.url.includes("/storage") ||
        req.url.includes("/ai") ||
        req.url.includes("/billing") ||
        req.url.includes("/portability") ||
        req.url.includes("/workspaces/");

      if (isWorkspaceDomain) {
        throw new ForbiddenException(
          "Missing workspace context. X-Workspace-ID header is required.",
        );
      }

      return true;
    }

    if (!user?.id) {
      throw new ForbiddenException("Authentication required");
    }

    // Cache workspace existence check (5 min TTL)
    const ws = await this.cache.getOrSet(
      `ws:${workspaceId}:exists`,
      async () => {
        const result = await this.db.query.workspaces.findFirst({
          where: eq(schema.workspaces.id, workspaceId),
        });
        return result ?? null;
      },
      300,
    );

    if (!ws) {
      throw new NotFoundException("Workspace not found");
    }

    // Cache membership lookup (60s TTL)
    const membership = await this.cache.getOrSet(
      `ws:${workspaceId}:u:${user.id}:member`,
      async () => {
        const result = await this.db.query.memberships.findFirst({
          where: and(
            eq(schema.memberships.workspaceId, workspaceId),
            eq(schema.memberships.userId, user.id as string),
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
      throw new ForbiddenException("Your membership is not active");
    }

    req.workspace = {
      id: ws.id,
      name: ws.name,
      role: membership.role,
      status: membership.status,
    } as WorkspaceContext;

    // Attach workspace role to user for downstream RBAC
    req.user = { ...req.user, workspaceRole: membership.role };

    // Set workspace in request context for RLS
    this.contextService.workspaceId = ws.id;
    this.contextService.userId = user.id;
    req.tenantId = ws.id;

    return true;
  }
}
