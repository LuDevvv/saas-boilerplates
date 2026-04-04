import { Processor, WorkerHost, InjectQueue } from "@nestjs/bullmq";
import { Logger, OnModuleDestroy } from "@nestjs/common";
import { db, schema, eq } from "@node-stack/db";
import { Job, Queue } from "bullmq";
import { WebhookDispatcher } from "./webhook-dispatcher.service";

export type EventHandler = (event: Record<string, unknown>) => Promise<void>;
export type EventHandlers = Record<string, EventHandler>;

@Processor("outbox")
export class OutboxProcessor extends WorkerHost implements OnModuleDestroy {
  private readonly logger = new Logger(OutboxProcessor.name);
  private successCount = 0;
  private failureCount = 0;

  constructor(
    @InjectQueue("outbox") private jobQueue: Queue,
    private readonly webhookDispatcher: WebhookDispatcher,
  ) {
    super();
  }

  private readonly maxRetries: number =
    Number(process.env.BULLMQ_OUTBOX_ATTEMPTS) || 3;
  private readonly baseDelayMs: number =
    Number(process.env.BULLMQ_OUTBOX_BACKOFF_DELAY) || 5000;
  private readonly backoffType: string =
    process.env.BULLMQ_OUTBOX_BACKOFF_TYPE || "exponential";

  /**
   * Lifecycle hook called by NestJS when the module is being destroyed (app.close()).
   * Gracefully closes the BullMQ worker — stops accepting new jobs and waits for
   * active jobs to finish before the process exits.
   */
  async onModuleDestroy() {
    this.logger.log(
      "[Worker] Gracefully closing BullMQ outbox worker...",
    );
    await this.worker.close();
    this.logger.log(
      `[Worker] Outbox worker closed. Stats: ${this.successCount} succeeded, ${this.failureCount} failed.`,
    );
  }

  async process(job: Job<Record<string, unknown>, unknown, string>): Promise<void> {
    const outboxId = job.data?.outboxId as string;
    const event = await db.query.outbox.findFirst({
      where: eq(schema.outbox.id, outboxId),
    });

    if (!event) return;

    const handler = this.getHandlerForEvent(event.eventType);
    if (!handler) {
      await db
        .update(schema.outbox)
        .set({
          processed: true,
          processedAt: new Date(),
          lastError: "No handler for event",
        })
        .where(eq(schema.outbox.id, outboxId));
      this.logger.warn(`No handler for event type: ${event.eventType}`);
      return;
    }

    try {
      await handler(event as unknown as Record<string, unknown>);
      await db
        .update(schema.outbox)
        .set({ processed: true, processedAt: new Date() })
        .where(eq(schema.outbox.id, outboxId));
      this.successCount++;
      this.logger.log(
        `Processed outbox ${outboxId} (${event.eventType}) - success (#${this.successCount})`,
      );

      // Trigger Webhook Dispatcher
      await this.webhookDispatcher.dispatch(
        event.eventType,
        event.payload as Record<string, unknown>,
        event.workspaceId ?? undefined,
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const retryCount = (event.retryCount ?? 0) + 1;
      await db
        .update(schema.outbox)
        .set({ retryCount, lastError: errorMessage })
        .where(eq(schema.outbox.id, outboxId));

      const delayMs = this.calculateBackoffDelay(retryCount);
      if (retryCount < this.maxRetries) {
        await this.jobQueue.add(
          "process-outbox",
          { outboxId },
          { delay: delayMs },
        );
      } else {
        await db
          .update(schema.outbox)
          .set({
            processed: true,
            processedAt: new Date(),
            lastError: `Max retries reached: ${errorMessage}`,
          })
          .where(eq(schema.outbox.id, outboxId));
        this.failureCount++;
        this.logger.warn(
          `Outbox ${outboxId} failed after ${this.maxRetries} retries (total failures: ${this.failureCount})`,
        );
      }
    }
  }

  private getHandlerForEvent(
    eventType: string,
  ): EventHandler | null {
    switch (eventType) {
      case "user.registered":
        return async (event: Record<string, unknown>) => {
          // Placeholder: implement actual processing logic (e.g., send welcome email)
          this.logger.debug(
            `Handling event: ${String(event.eventType)} with payload: ${JSON.stringify(event.payload)}`,
          );
        };
      // Add more event types as needed
      default:
        return null;
    }
  }

  private calculateBackoffDelay(attempt: number): number {
    if (this.backoffType === "fixed") {
      return this.baseDelayMs;
    }
    // exponential backoff
    return this.baseDelayMs * Math.pow(2, attempt - 1);
  }
}
