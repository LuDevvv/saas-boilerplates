import type { EmailJobPayload, QueueMessage } from "@workspace/types";
import { EmailJobPayloadSchema } from "@workspace/types";
import { JobType } from "@workspace/types";
import { renderEmail } from "./render";
import { Resend } from "resend";
import * as Sentry from "@sentry/cloudflare";

interface Env {
  RESEND_API_KEY: string;
  SENTRY_DSN: string;
  SENTRY_ENVIRONMENT: string;
  DATABASE_URL: string;
  JOBS_QUEUE: any;
  JWT_SECRET: string;
}

const worker = {
  async queue(batch: MessageBatch<QueueMessage>, env: Env): Promise<void> {
    const resend = new Resend(env.RESEND_API_KEY);

    for (const message of batch.messages) {
      const jobType = message.body.type;

      if (jobType === JobType.PROCESS_OUTBOX) {
        await this.handleOutboxProcessing(message, env);
        continue;
      }

      if (jobType === JobType.SEND_WELCOME_EMAIL || 
          jobType === JobType.SEND_PASSWORD_RESET_EMAIL) {
        await this.handleEmailJob(message, env, resend);
        continue;
      }

      console.log(`[Jobs] Unknown job type: ${jobType}`);
      message.ack();
    }
  },

  async handleOutboxProcessing(message: any, env: Env): Promise<void> {
    console.log("[Jobs] Processing outbox via queue dispatch");
    
    try {
      const { createDbClient } = await import("@workspace/db");
      const { createQueueService } = await import("../common/services/queue.service");
      const { createAuthService, create2faService } = await import("@workspace/services");
      const { createJwtService } = await import("../common/services/jwt.service");
      
      const db = createDbClient(env.DATABASE_URL);
      const queue = createQueueService(env.JOBS_QUEUE);
      const jwt = createJwtService(env.JWT_SECRET || "dev-secret");
      const tfa = create2faService();
      const auth = createAuthService(db, queue, jwt, tfa);

      await auth.processOutbox();
      message.ack();
    } catch (error) {
      console.error("[Jobs] Outbox processing failed:", error);
      message.retry();
    }
  },

  async handleEmailJob(message: any, env: Env, resend: any): Promise<void> {
    const parsed = EmailJobPayloadSchema.safeParse(message.body.payload);

    if (!parsed.success) {
      console.error(
        `[Jobs] Invalid payload for message ${message.id}:`,
        parsed.error.flatten(),
      );
      Sentry.captureMessage(`Invalid email job payload: ${message.id}`, {
        extra: { error: parsed.error.flatten() },
        level: "error",
      });
      message.ack();
      return;
    }

    const { to, subject, templateName, templateData, traceId } = parsed.data;
    console.log(
      `[Jobs] Processing email: ${templateName} to ${to} (Trace: ${traceId || "none"})`,
    );

    try {
      const html = renderEmail(templateName, templateData);

      const { error } = await resend.emails.send({
        from: "L.A. Labs <noreply@resend.dev>",
        to,
        subject,
        html,
      });

      if (error) {
        console.error(`[Jobs] Resend error for ${to}:`, error);
        Sentry.captureException(error, {
          tags: { templateName, recipient: to },
        });
        message.retry();
        return;
      }

      console.log(`[Jobs] Email sent to ${to} (template: ${templateName})`);
      message.ack();
    } catch (error) {
      console.error(
        `[Jobs] Failed to process email job ${message.id}:`,
        error,
      );
      Sentry.captureException(error, {
        tags: { templateName, recipient: to },
      });
      message.retry();
    }
  },
};

export default Sentry.wrap(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT,
    tracesSampleRate: 1.0,
  }),
  worker,
);
