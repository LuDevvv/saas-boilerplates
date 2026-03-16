import type { Context } from "hono";
import type { AppContext } from "../types/env";
import { createQueueService } from "./queue.service";

/**
 * Service for tracking user activity and system events.
 * Enqueues tasks to Cloudflare Queues for asynchronous persistence,
 * ensuring 0ms impact on the main request execution.
 */
export const AuditService = {
  /**
   * Records a significant action performed by a user or the system.
   *
   * @param c - Hono context for extracting environment and request data
   * @param options - Log details including action type and target entity
   */
  async trackAction(
    c: Context<AppContext>,
    options: {
      /** Descriptive identifier for the action (e.g. 'user.login', 'billing.checkout') */
      action: string;
      /** Data model type identifier */
      entityType?: string;
      /** Primary key of the affected entity */
      entityId?: string;
      /** Contextual JSON data for the event */
      metadata?: Record<string, unknown>;
    },
  ): Promise<void> {
    const workspaceId = c.get("workspaceId");
    const userId = c.get("userId");
    const clientIp = c.get("clientIp");
    const userAgent = c.req.header("user-agent");

    const queueService = createQueueService(c.env.JOBS_QUEUE);

    c.executionCtx.waitUntil(
      queueService.enqueueActivityLog({
        workspaceId,
        userId,
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        metadata: options.metadata,
        ipAddress: clientIp,
        userAgent: userAgent,
      }),
    );
  },

  /**
   * Retrieves recent activity logs for a specific workspace.
   */
  async getWorkspaceLogs(db: any, workspaceId: string) {
    const { AuditRepository } = await import("@workspace/db");
    return await AuditRepository.getWorkspaceLogs(db, workspaceId);
  },
};
