import { ForbiddenException, Injectable, NotFoundException, Inject } from "@nestjs/common";
import {
  AuditLogRepository,
  DB_TOKEN,
  WorkspaceRepository,
  withTenantTx,
} from "@node-stack/db";
import type { Database } from "@node-stack/db";

/**
 * Owner-initiated workspace closure (DELETE /api/v1/workspaces/:id).
 *
 * Per ADR 0003: soft-deletes the workspace, marks all memberships as
 * 'removed'. The cron at MaintenanceService.hardDeleteExpiredWorkspaces
 * hard-deletes the row 30 days later.
 */
@Injectable()
export class WorkspaceDeletionService {
  constructor(
    private readonly workspaceRepo: WorkspaceRepository,
    private readonly auditLog: AuditLogRepository,
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {}

  async closeWorkspace(
    workspaceId: string,
    actorUserId: string,
    reason: string | null,
    ctx: { ipAddress?: string | null; userAgent?: string | null } = {},
  ): Promise<void> {
    await withTenantTx(workspaceId, async (tx) => {
      const ws = await this.workspaceRepo.findById(workspaceId, tx);
      if (!ws) {
        throw new NotFoundException("Workspace not found");
      }

      const membership = await this.workspaceRepo.findMembership(
        workspaceId,
        actorUserId,
        tx,
      );
      if (!membership || membership.role !== "owner") {
        throw new ForbiddenException("Only the workspace owner can close it");
      }

      await this.workspaceRepo.softDeleteWorkspace(
        workspaceId,
        actorUserId,
        reason,
        tx,
      );

      await this.auditLog.create(
        {
          workspaceId,
          userId: actorUserId,
          action: "workspace.workspace_closed",
          entityType: "workspace",
          entityId: workspaceId,
          metadata: { reason: reason ?? null, slug: ws.slug, name: ws.name },
          ipAddress: ctx.ipAddress ?? null,
          userAgent: ctx.userAgent ?? null,
        },
        tx,
      );
    }, this.db);
  }
}
