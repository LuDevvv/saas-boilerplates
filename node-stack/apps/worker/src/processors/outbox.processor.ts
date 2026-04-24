import { Processor, InjectQueue } from "@nestjs/bullmq";
import { Logger, Inject } from "@nestjs/common";
import { schema, eq, RequestContextService, DB_TOKEN, type Database } from "@node-stack/db";
import { Job, Queue } from "bullmq";
import { WebhookDispatcher } from "./webhook-dispatcher.service.js";
import { BaseWorker } from "../base.worker.js";

@Processor("outbox")
export class OutboxProcessor extends BaseWorker {
  protected readonly logger = new Logger(OutboxProcessor.name);
  protected readonly queueName = "outbox";
  private successCount = 0;
  private failureCount = 0;

  constructor(
    @InjectQueue("outbox") private jobQueue: Queue,
    @InjectQueue("dlq") private readonly dlqQueue: Queue,
    @Inject(WebhookDispatcher) private readonly webhookDispatcher: WebhookDispatcher,
    @Inject(DB_TOKEN) private readonly db: Database,
    protected readonly contextService: RequestContextService,
  ) {
    super(contextService);
  }

  protected getDlqQueue(): Queue {
    return this.dlqQueue;
  }

  private readonly maxRetries: number =
    Number(process.env.BULLMQ_OUTBOX_ATTEMPTS) || 3;
  private readonly baseDelayMs: number =
    Number(process.env.BULLMQ_OUTBOX_BACKOFF_DELAY) || 5000;
  private readonly backoffType: string =
    process.env.BULLMQ_OUTBOX_BACKOFF_TYPE || "exponential";

  async processJob(job: Job<Record<string, unknown>, unknown, string>): Promise<void> {
    if (job.name === "relay-outbox") {
      await this.relayOutbox();
      return;
    }

    const outboxId = job.data?.outboxId as string;
    const event = await this.db.query.outbox.findFirst({
      where: eq(schema.outbox.id, outboxId),
    });

    if (!event) return;

    const handler = this.getHandlerForEvent(event.eventType);
    if (!handler) {
      await this.db
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
      await this.db
        .update(schema.outbox)
        .set({ processed: true, processedAt: new Date() })
        .where(eq(schema.outbox.id, outboxId));
      this.successCount++;
      this.logger.log(
        `Processed outbox ${outboxId} (${event.eventType}) - success (#${this.successCount})`,
      );

      // Trigger Webhook Dispatcher
      await this.webhookDispatcher?.dispatch(
        event.eventType,
        event.payload as Record<string, unknown>,
        event.workspaceId ?? undefined,
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const retryCount = (event.retryCount ?? 0) + 1;
      await this.db
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
        await this.db
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

  private async relayOutbox() {
    const pendingEvents = await this.db.query.outbox.findMany({
      where: eq(schema.outbox.processed, false),
      limit: 100,
    });

    if (pendingEvents.length === 0) return;

    this.logger.log(`[Relay] Found ${pendingEvents.length} pending outbox events. Publishing to queue...`);

    for (const event of pendingEvents) {
      try {
        // We push to queue and mark as processed in DB.
        // Even though Redis and Postgres aren't in a single transaction, 
        // we can use a DB transaction to ensure consistency if the queue add fails.
        await this.jobQueue.add("process-outbox", { outboxId: event.id });
        
        await this.db
          .update(schema.outbox)
          .set({ 
            processed: true, 
            processedAt: new Date(),
            lastError: null // Clear any previous errors if it was a retry
          })
          .where(eq(schema.outbox.id, event.id));
      } catch (error) {
        this.logger.error(`Failed to relay outbox event ${event.id}`, error);
      }
    }
  }

  private getHandlerForEvent(
    eventType: string,
  ): ((event: Record<string, unknown>) => Promise<void>) | null {
    switch (eventType) {
      case "user.registered":
        return async (event: Record<string, unknown>) => {
          const payload = event.payload as any;
          this.logger.log(`[DEV: EMAIL MOCK] Welcome to the platform! Sent to: ${payload.email}`);
        };
      case "user.forgot_password":
        return async (event: Record<string, unknown>) => {
          const payload = event.payload as any;
          this.logger.log(`\n==========================================\n[DEV: EMAIL MOCK] Password Reset\nTo: ${payload.email}\n[BODY]: You requested a password reset. Here is your secret token: ${payload.token}\n==========================================\n`);
        };
      case "user.email_verification":
        return async (event: Record<string, unknown>) => {
          const payload = event.payload as any;
          this.logger.log(`\n==========================================\n[DEV: EMAIL MOCK] Email Verification\nTo: ${payload.email}\n[BODY]: Please verify your email. Here is your secret token: ${payload.token}\n==========================================\n`);
        };
      case "user.password_changed":
        return async (event: Record<string, unknown>) => {
          const payload = event.payload as any;
          this.logger.log(`[DEV: EMAIL MOCK] Your password was successfully changed.`);
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

  /** Override base onModuleDestroy to include worker stats */
  async onModuleDestroy() {
    this.logger.log(
      `[Worker] Gracefully closing BullMQ outbox worker...`,
    );
    await this.worker.close();
    this.logger.log(
      `[Worker] Outbox worker closed. Stats: ${this.successCount} succeeded, ${this.failureCount} failed.`,
    );
  }
}
