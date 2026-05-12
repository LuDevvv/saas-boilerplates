export * from "./providers/types.js";
export * from "./providers/ses.provider.js";
export * from "./providers/resend.provider.js";
export * from "./providers/console.provider.js";
export * from "./render.js";
export { WelcomeEmail } from "./templates/WelcomeEmail.js";
export { InvitationEmail } from "./templates/InvitationEmail.js";
export { OtpVerificationEmail } from "./templates/OtpVerificationEmail.js";
export { PasswordResetEmail } from "./templates/PasswordResetEmail.js";
export { PasswordChangedEmail } from "./templates/PasswordChangedEmail.js";

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
   * Send a typed email using a React Email template.
   * In non-production environments, emails are redirected to TEST_EMAIL_ADDRESS
   * (or delivered@resend.dev) and the subject is prefixed with [DEV].
   */
  async sendTyped(
    to: string,
    subject: string,
    template: EmailTemplate,
    from?: string,
  ): Promise<void> {
    const actualFrom = from ?? process.env.EMAIL_FROM ?? "noreply@nodestack.local";

    let actualTo = to;
    let actualSubject = subject;
    if (process.env.NODE_ENV !== "production") {
      // Use || not ?? — TEST_EMAIL_ADDRESS="" (empty string) should fall through to the default
      actualTo = process.env.TEST_EMAIL_ADDRESS || "delivered@resend.dev";
      actualSubject = `[DEV] ${actualSubject}`;
    }

    const { html, text } = await renderEmail(template);
    await this.provider.sendEmail({
      to: actualTo,
      from: actualFrom,
      subject: actualSubject,
      html,
      text,
    });
  }

  /**
   * @deprecated Use sendTyped() instead.
   */
  public async sendEmail(options: LegacyEmailOptions): Promise<void> {
    const defaultFromField = process.env.EMAIL_FROM || "noreply@nodestack.local";
    let { to, subject, templateName, templateData, from = defaultFromField } = options;

    if (process.env.NODE_ENV !== "production") {
      to = process.env.TEST_EMAIL_ADDRESS || "delivered@resend.dev";
      subject = `[DEV] ${subject}`;
    }

    let mappedTemplate: EmailTemplate | null = null;
    if (templateName === "welcome") {
      mappedTemplate = {
        name: "WELCOME",
        data: {
          name: String(templateData.name ?? ""),
          dashboardUrl: String(templateData.loginUrl ?? "#"),
        },
      };
    }

    if (mappedTemplate) {
      const { html, text } = await renderEmail(mappedTemplate);
      await this.provider.sendEmail({ to, subject, html, text, from });
    } else {
      await this.provider.sendEmail({
        to,
        subject,
        html: `<p>Fallback template for ${templateName}</p>`,
        from,
      });
    }
  }
}
