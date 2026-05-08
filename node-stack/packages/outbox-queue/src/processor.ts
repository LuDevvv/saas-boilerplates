import { Processor, WorkerHost } from "@nestjs/bullmq";
import { db, schema, eq } from "@node-stack/db";
import { EmailSender } from "@node-stack/emails";
import type { Job } from "bullmq";

const MAX_RETRIES = 5;

interface OutboxJobData {
  outboxId: string;
}

interface OutboxEventPayload {
  email?: string;
  token?: string;
  [key: string]: unknown;
}

@Processor("outbox")
export class OutboxProcessor extends WorkerHost {
  async process(job: Job<OutboxJobData>, _token?: string): Promise<void> {
    const outboxId = job.data?.outboxId;
    if (!outboxId) return;

    const event = await db.query.outbox.findFirst({
      where: eq(schema.outbox.id, outboxId),
    });

    if (!event) {
      return;
    }

    try {
      const emailSender = new EmailSender();
      const payload = event.payload as OutboxEventPayload;

      switch (event.eventType) {
        case "user.registered":
          break;
        case "user.forgot_password":
          if (payload.email) {
            await emailSender.sendEmail({
              to: payload.email,
              subject: "Reset your password",
              templateName: "reset_password",
              templateData: { token: payload.token },
            });
          }
          break;
        case "user.email_verification":
          if (payload.email) {
            await emailSender.sendEmail({
              to: payload.email,
              subject: "Verify your email address",
              templateName: "verify_email",
              templateData: { token: payload.token },
            });
          }
          break;
        case "workspace.created":
          break;
        default:
          break;
      }

      await db
        .update(schema.outbox)
        .set({ processed: true, processedAt: new Date() })
        .where(eq(schema.outbox.id, outboxId));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const retryCount = (event.retryCount ?? 0) + 1;
      await db
        .update(schema.outbox)
        .set({ retryCount, lastError: message })
        .where(eq(schema.outbox.id, outboxId));

      if (retryCount >= MAX_RETRIES) {
        await db
          .update(schema.outbox)
          .set({ processed: true })
          .where(eq(schema.outbox.id, outboxId));
      }

      throw error;
    }
  }
}
