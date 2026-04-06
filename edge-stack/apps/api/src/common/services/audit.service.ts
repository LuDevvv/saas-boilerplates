import type { QueueService } from "./queue.service";
import type { Context } from "hono";
import type { AppContext } from "../types/env";

/**
 * Service for tracking user activity and system events.
 * Enqueues tasks to Cloudflare Queues for asynchronous persistence,
 * ensuring 0ms impact on the main request execution.
 */
export const createAuditService = (queue: QueueService) => {
  const trackAction = async (options: {
    action: string;
    workspaceId?: string;
    userId?: string;
    clientIp?: string;
    userAgent?: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> => {
    await queue.enqueueActivityLog({
      workspaceId: options.workspaceId,
      userId: options.userId,
      action: options.action,
      entityType: options.entityType,
      entityId: options.entityId,
      metadata: options.metadata,
      ipAddress: options.clientIp,
      userAgent: options.userAgent,
    });
  };

  const trackActionFromContext = async (
    c: Context<AppContext>,
    options: {
      action: string;
      entityType?: string;
      entityId?: string;
      actorId?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<void> => {
    const services = c.get("services");
    if (!services?.queue) {
      console.warn("[AuditService] Queue service not available");
      return;
    }
    
    const auditService = createAuditService(services.queue);
    await auditService.trackAction({
      action: options.action,
      workspaceId: c.get("workspaceId"),
      userId: options.actorId || c.get("userId"),
      clientIp: c.get("clientIp"),
      userAgent: c.req.header("User-Agent"),
      entityType: options.entityType,
      entityId: options.entityId,
      metadata: options.metadata,
    });
  };

  return {
    trackAction,
    trackActionFromContext,
    /**
     * Retrieves recent activity logs for a specific workspace.
     */
    getWorkspaceLogs: async (db: any, workspaceId: string) => {
      const { AuditRepository } = await import("@workspace/db");
      return await AuditRepository.getWorkspaceLogs(db, workspaceId);
    },
  };
};

export type AuditService = ReturnType<typeof createAuditService>;
