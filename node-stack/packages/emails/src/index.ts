export * from "./providers/types.js";
export * from "./providers/ses.provider.js";
export * from "./providers/resend.provider.js";
export * from "./providers/console.provider.js";
export * from "./render.js";

import { ConsoleProvider } from "./providers/console.provider.js";
import { ResendProvider } from "./providers/resend.provider.js";
import { SESProvider } from "./providers/ses.provider.js";
import { IEmailProvider } from "./providers/types.js";
import { renderEmail, EmailTemplate } from "./render.js";

export interface LegacyEmailOptions {
  to: string | string[];
  subject: string;
  templateName: string;
  templateData: Record<string, unknown>;
  from?: string;
}

export class EmailSender {
  private provider: IEmailProvider;

  constructor() {
    const providerType = process.env.EMAIL_PROVIDER || "console";

    if (providerType === "resend" && process.env.RESEND_API_KEY) {
      this.provider = new ResendProvider({
        apiKey: process.env.RESEND_API_KEY,
      });
    } else if (
      providerType === "ses" &&
      process.env.AWS_REGION &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    ) {
      this.provider = new SESProvider({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    } else {
      this.provider = new ConsoleProvider();
    }
  }

  /**
   * @deprecated Use the new provider pattern or NotificationService
   */
  public async sendEmail(options: LegacyEmailOptions): Promise<void> {
    const defaultFromField = process.env.EMAIL_FROM || "noreply@nodestack.local";
    let { to, subject, templateName, templateData, from = defaultFromField } = options;

    // En desarrollo, desviar correos a un correo de prueba seguro si está configurado, o al de resend
    if (process.env.NODE_ENV !== "production") {
      to = process.env.TEST_EMAIL_ADDRESS || "delivered@resend.dev";
      subject = `[DEV] ${subject}`;
    }

    // Map old names to new types for compatibility during migration
    let mappedTemplate: EmailTemplate | null = null;
    if (templateName === "welcome") {
      mappedTemplate = { name: "WELCOME", data: { name: String(templateData.name ?? ""), loginUrl: String(templateData.loginUrl ?? "#") } };
    }

    if (mappedTemplate) {
      const { html, text } = await renderEmail(mappedTemplate);
      await this.provider.sendEmail({
        to,
        subject,
        html,
        text,
        from,
      });
    } else {
      // Fallback for non-migrated templates
      await this.provider.sendEmail({
        to,
        subject,
        html: `Fallback template for ${templateName}`,
        from,
      });
    }
  }
}
