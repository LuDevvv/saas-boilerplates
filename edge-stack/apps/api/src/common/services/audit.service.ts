import type { QueueService } from "./queue.service";

/**
 * Service for tracking user activity and system events.
 * Enqueues tasks to Cloudflare Queues for asynchronous persistence,
 * ensuring 0ms impact on the main request execution.
 */
export const createAuditService = (queue: QueueService) => {
  return {
    /**
     * Records a significant action performed by a user or the system.
     */
    trackAction: async (options: {
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
    },

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
