import { Processor, InjectQueue } from "@nestjs/bullmq";
import { Logger, Inject } from "@nestjs/common";
import { schema, eq, withSystemTx, RequestContextService, DB_TOKEN, type Database } from "@node-stack/db";
import { EmailSender } from "@node-stack/emails";
import { Job, Queue } from "bullmq";

import { BaseWorker } from "../base.worker.js";
import { WebhookDispatcher } from "./webhook-dispatcher.service.js";

interface OutboxEventPayload {
  email?: string;
  name?: string;
  token?: string;
  code?: string;
  userId?: string;
  subscriptionId?: string;
  invitationId?: string;
}

@Processor("outbox")
export class OutboxProcessor extends BaseWorker {
  protected readonly logger = new Logger(OutboxProcessor.name);
  protected readonly queueName = "outbox";
  private successCount = 0;
  private failureCount = 0;
  private readonly emailSender = new EmailSender();

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

  private async relayOutbox(): Promise<void> {
    const pendingEvents = await this.db.query.outbox.findMany({
      where: eq(schema.outbox.processed, false),
      limit: 100,
    });

    if (pendingEvents.length === 0) return;

    this.logger.log(`[Relay] Found ${pendingEvents.length} pending outbox events. Publishing to queue...`);

    for (const event of pendingEvents) {
      try {
        await this.jobQueue.add("process-outbox", { outboxId: event.id });

        await this.db
          .update(schema.outbox)
          .set({
            processed: true,
            processedAt: new Date(),
            lastError: null,
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
          const payload = event.payload as OutboxEventPayload;
          if (!payload.email) return;
          const email = payload.email;
          const name: string = payload.name ?? email.split("@")[0] ?? "Usuario";
          const dashboardUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
          await this.emailSender.sendTyped(
            email,
            "¡Bienvenido a NodeStack!",
            { name: "WELCOME", data: { name, dashboardUrl } },
          );
        };

      case "user.email_verification":
        return async (event: Record<string, unknown>) => {
          const payload = event.payload as OutboxEventPayload;
          if (!payload.email) return;
          const code = payload.token ?? payload.code ?? "";
          await this.emailSender.sendTyped(
            payload.email,
            "Verifica tu correo electrónico",
            { name: "OTP_VERIFICATION", data: { code, expiresInMinutes: 15 } },
          );
        };

      case "user.forgot_password":
        return async (event: Record<string, unknown>) => {
          const payload = event.payload as OutboxEventPayload;
          if (!payload.email || !payload.token) return;
          const dashboardUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
          const resetUrl = `${dashboardUrl}/auth/reset-password?token=${payload.token}`;
          await this.emailSender.sendTyped(
            payload.email,
            "Restablecer tu contraseña",
            { name: "RESET_PASSWORD", data: { resetUrl, expiresInHours: 1 } },
          );
        };

      case "user.password_changed":
        return async (event: Record<string, unknown>) => {
          const payload = event.payload as OutboxEventPayload;
          let email = payload.email;
          if (!email && payload.userId) {
            const user = await this.db.query.users.findFirst({
              where: eq(schema.users.id, payload.userId),
              columns: { email: true, name: true },
            });
            email = user?.email;
          }
          if (!email) return;
          const name: string = payload.name ?? email.split("@")[0] ?? "Usuario";
          await this.emailSender.sendTyped(
            email,
            "Tu contraseña ha sido actualizada",
            { name: "PASSWORD_CHANGED", data: { name } },
          );
        };

      case "invitation.sent":
        return async (event: Record<string, unknown>) => {
          const payload = event.payload as OutboxEventPayload & {
            workspaceId?: string;
            token?: string;
            expiresAt?: string;
          };
          if (!payload.email || !payload.token || !payload.workspaceId) return;

          const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
          const acceptUrl = `${frontendUrl}/invitations/${payload.token}`;

          // Resolve workspace name for the email subject/body
          const wsRows = await withSystemTx(async (tx) => {
            return tx
              .select({ name: schema.workspaces.name })
              .from(schema.workspaces)
              .where(eq(schema.workspaces.id, payload.workspaceId!))
              .limit(1);
          }, this.db);
          const workspaceName = wsRows[0]?.name ?? "tu equipo";

          const expiresAt = payload.expiresAt
            ? new Date(payload.expiresAt).toLocaleDateString("es-ES", {
                day: "numeric", month: "long", year: "numeric",
              })
            : undefined;

          await this.emailSender.sendTyped(
            payload.email,
            `Invitación para unirte a ${workspaceName}`,
            { name: "INVITATION", data: { workspaceName, acceptUrl, expiresAt } },
          );
        };

      default:
        return null;
    }
  }

  private calculateBackoffDelay(attempt: number): number {
    if (this.backoffType === "fixed") {
      return this.baseDelayMs;
    }
    return this.baseDelayMs * Math.pow(2, attempt - 1);
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log(`[Worker] Gracefully closing BullMQ outbox worker...`);
    await this.worker.close();
    this.logger.log(
      `[Worker] Outbox worker closed. Stats: ${this.successCount} succeeded, ${this.failureCount} failed.`,
    );
  }
}
