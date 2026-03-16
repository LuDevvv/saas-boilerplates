import type { EmailJobPayload } from "@workspace/types";
import { EmailJobPayloadSchema } from "@workspace/types";
import { renderEmail } from "./render";
import { Resend } from "resend";

/**
 * Cloudflare Worker environment bindings for the Jobs Worker.
 */
interface Env {
  RESEND_API_KEY: string;
}

/**
 * Jobs Worker — Cloudflare Queue Consumer.
 * Handles heavy tasks: React-Email rendering + Resend delivery.
 * Isolated from the Core API to keep its bundle lean (< 400KB).
 */
export default {
  async queue(batch: MessageBatch<EmailJobPayload>, env: Env): Promise<void> {
    const resend = new Resend(env.RESEND_API_KEY);

    for (const message of batch.messages) {
      const parsed = EmailJobPayloadSchema.safeParse(message.body);

      if (!parsed.success) {
        console.error(
          `[Jobs] Invalid payload for message ${message.id}:`,
          parsed.error.flatten(),
        );
        message.ack(); // Do not retry malformed payloads
        continue;
      }

      const { to, subject, templateName, templateData } = parsed.data;

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
        message.retry();
      }
    }
  },
};
