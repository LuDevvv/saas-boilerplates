export * from "./providers/types";
export * from "./providers/ses.provider";
export * from "./providers/console.provider";
export * from "./render";

import { ConsoleProvider } from "./providers/console.provider";
import { SESProvider } from "./providers/ses.provider";
import { IEmailProvider, SendEmailOptions } from "./providers/types";
import { renderEmail, EmailTemplate } from "./render";

export interface LegacyEmailOptions {
  to: string | string[];
  subject: string;
  templateName: any; // Keep compatible for now
  templateData: any;
  from?: string;
}

export class EmailSender {
  private provider: IEmailProvider;

  constructor() {
    if (
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
    const { to, subject, templateName, templateData, from = defaultFromField } = options;

    // Map old names to new types for compatibility during migration
    let mappedTemplate: EmailTemplate | null = null;
    if (templateName === "welcome") {
      mappedTemplate = { name: "WELCOME", data: { name: templateData.name, loginUrl: templateData.loginUrl || "#" } };
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
