import { JobType, type QueueMessage } from "@workspace/types";
import * as Sentry from "@sentry/cloudflare";

/**
 * Interface for the Queue Service.
 */
export interface QueueService {
  /**
   * Internal generic emit method.
   * @param message - The QueueMessage object
   */
  emit(message: QueueMessage): Promise<void>;

  /**
   * @param type - The job identifier
   * @param payload - Data required for the job
   * @param traceId - Optional trace ID override
   */
  enqueue<T>(type: JobType, payload: T, traceId?: string): Promise<void>;

  /**
   * Helper to enqueue a welcome email.
   */
  enqueueWelcomeEmail(data: { email: string; name: string }): Promise<void>;

  /**
   * Helper to enqueue a password reset email.
   */
  enqueuePasswordResetEmail(data: {
    email: string;
    token: string;
  }): Promise<void>;

  /**
   * Enqueues a billing synchronization task.
   */
  enqueueBillingSync(data: {
    userId: string;
    workspaceId: string;
    stripeCustomerId: string;
    payload: Record<string, any>;
  }): Promise<void>;

  /**
   * Enqueues an activity log task.
   */
  enqueueActivityLog(data: {
    workspaceId?: string;
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void>;

  /**
   * Enqueues a usage metrics synchronization task.
   */
  enqueueUsageSync(data: {
    workspaceId: string;
    metricName: string;
    currentUsage: number;
  }): Promise<void>;

  /**
   * Fast-track outbox processor.
   * Triggers immediate queue dispatch for outbox events.
   * Used for sub-second latency after transaction commits.
   */
  dispatchOutboxPing(): Promise<void>;
}

/**
 * Factory to create the strictly typed Queue Service.
 * Decouples the Cloudflare Queue binding from domain logic.
 *
 * @param queue - The bound Cloudflare Queue instance
 */
export const createQueueService = (
  queue: Queue<QueueMessage>,
): QueueService => {
  const emit = async (message: QueueMessage): Promise<void> => {
    await queue.send(message);
  };

  const enqueue = async <T>(
    type: JobType,
    payload: T,
    traceId?: string,
  ): Promise<void> => {
    // Attempt to auto-resolve traceId from Sentry if not provided
    const resolvedTraceId = traceId || Sentry.getActiveSpan()?.spanContext().traceId;

    await emit({
      type,
      payload,
      timestamp: Date.now(),
      traceId: resolvedTraceId,
    });
  };

  return {
    emit,
    enqueue,

    async enqueueWelcomeEmail(data: { email: string; name: string }) {
      await enqueue(JobType.SEND_WELCOME_EMAIL, data);
    },

    async enqueueBillingSync(data: {
      userId: string;
      workspaceId: string;
      stripeCustomerId: string;
      payload: Record<string, any>;
    }) {
      await enqueue(JobType.PROCESS_PAYMENT_WEBHOOK, data);
    },

    async enqueueActivityLog(data) {
      await enqueue(JobType.LOG_ACTIVITY, data);
    },

    async enqueueUsageSync(data) {
      await enqueue(JobType.SYNC_USAGE_METRICS, data);
    },

    async enqueuePasswordResetEmail(data: { email: string; token: string }) {
      await enqueue(JobType.SEND_PASSWORD_RESET_EMAIL, data);
    },

    async dispatchOutboxPing() {
      await enqueue(JobType.PROCESS_OUTBOX, { ping: true }, undefined);
    },
  };
};
