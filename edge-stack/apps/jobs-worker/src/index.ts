import type { EmailJobPayload } from "@workspace/types";
import { EmailJobPayloadSchema } from "@workspace/types";
import { renderEmail } from "./render";
import { Resend } from "resend";
import * as Sentry from "@sentry/cloudflare";

/**
 * Cloudflare Worker environment bindings for the Jobs Worker.
 */
interface Env {
  RESEND_API_KEY: string;
  SENTRY_DSN: string;
  SENTRY_ENVIRONMENT: string;
}

/**
 * Jobs Worker — Cloudflare Queue Consumer.
 * Handles heavy tasks: React-Email rendering + Resend delivery.
 * Isolated from the Core API to keep its bundle lean (< 400KB).
 */
const worker = {
  async queue(batch: MessageBatch<EmailJobPayload>, env: Env): Promise<void> {
    const resend = new Resend(env.RESEND_API_KEY);

    for (const message of batch.messages) {
      const parsed = EmailJobPayloadSchema.safeParse(message.body);

      if (!parsed.success) {
        console.error(
          `[Jobs] Invalid payload for message ${message.id}:`,
          parsed.error.flatten(),
        );
        Sentry.captureMessage(`Invalid email job payload: ${message.id}`, {
          extra: { error: parsed.error.flatten() },
          level: "error",
        });
        message.ack(); // Do not retry malformed payloads
        continue;
      }

      const { to, subject, templateName, templateData, traceId } = parsed.data;
      console.log(
        `[Jobs] Processing email: ${templateName} to ${to} (Trace: ${traceId || "none"})`,
      );

      // Start a Sentry span manually if traceId is provided
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
          continue;
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
