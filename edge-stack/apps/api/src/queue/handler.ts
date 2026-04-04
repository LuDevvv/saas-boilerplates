import type { ExecutionContext } from "@cloudflare/workers-types";
import { JobType, type QueueMessage } from "@workspace/types";
import { createDbClient } from "@workspace/db";
import { createBillingService } from "@workspace/services";
import type { Bindings } from "../common/types/env";

/**
 * Queue handler for non-email background tasks (billing, activity logging).
 * Email jobs are now routed to the dedicated jobs-worker via EMAIL_QUEUE.
 *
 * @param batch - The batch of messages from Cloudflare Queues
 * @param env - Worker environment bindings
 * @param ctx - Execution context for the worker
 */
export const queueHandler = async (
  batch: MessageBatch<QueueMessage>,
  env: Bindings,
  ctx: ExecutionContext,
): Promise<void> => {
  const db = createDbClient(env.DATABASE_URL);
  const billingService = createBillingService(db);

  for (const message of batch.messages) {
    const { type, payload, traceId } = message.body;
    console.log(
      `[Queue] Processing job: ${type} (ID: ${message.id}, Trace: ${traceId || "none"})`,
    );

    try {
      switch (type) {
        case JobType.PROCESS_PAYMENT_WEBHOOK: {
          await billingService.syncSubscription(payload);
          console.log(
            `[Queue] Successfully synced billing for payload: ${message.id}`,
          );
          break;
        }

        case JobType.LOG_ACTIVITY: {
          const { AuditRepository } = await import("@workspace/db");
          await AuditRepository.createLog(db, {
            workspaceId: payload.workspaceId,
            userId: payload.userId,
            action: payload.action,
            entityType: payload.entityType,
            entityId: payload.entityId,
            metadata: payload.metadata,
            ipAddress: payload.ipAddress,
            userAgent: payload.userAgent,
          });
          console.log(`[Queue] Successfully persisted audit log: ${payload.action}`);
          break;
        }

        default: {
          console.warn(`[Queue] Unknown job type: ${type}`);
        }
      }

      message.ack();
    } catch (error) {
      console.error(
        `[Queue Error] Job ${message.id} of type ${type} failed:`,
        error,
      );
      message.retry();
    }
  }
};
