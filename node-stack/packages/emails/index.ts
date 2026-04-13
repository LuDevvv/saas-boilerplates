import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { renderTemplate, TemplateName, TemplateData } from "./emailTemplates";

export { renderTemplate, TemplateName, TemplateData };

export interface EmailOptions {
  to: string | string[];
  subject: string;
  templateName: TemplateName;
  templateData: TemplateData;
  from?: string;
}

export class EmailSender {
  private sesClient?: SESClient;

  constructor() {
    // Only initialize SES if we have the credentials or if we aren't explicitly mocking it
    // In local development, you might not want to configure AWS keys yet
    if (process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.sesClient = new SESClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
    }
  }

  public async sendEmail(options: EmailOptions): Promise<void> {
    const defaultFromField = process.env.EMAIL_FROM || "noreply@nodestack.local";
    const { to, subject, templateName, templateData, from = defaultFromField } = options;

    const htmlBody = renderTemplate(templateName, templateData);
    const toAddresses = Array.isArray(to) ? to : [to];

    // Development fallback
    if (!this.sesClient) {
      console.log("\n================ [DEV: EMAIL MOCK] ================\n");
      console.log(`[TO]: ${toAddresses.join(", ")}`);
      console.log(`[FROM]: ${from}`);
      console.log(`[SUBJECT]: ${subject}`);
      console.log(`[BODY]:\n${htmlBody}\n`);
      console.log("===================================================\n");
      return;
    }

    try {
      const command = new SendEmailCommand({
        Source: from,
        Destination: {
          ToAddresses: toAddresses,
        },
        Message: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: htmlBody, Charset: "UTF-8" },
          },
        },
      });

      await this.sesClient.send(command);
      console.log(`[EmailSender] Email sent successfully to ${toAddresses.join(", ")}`);
    } catch (error) {
      console.error("[EmailSender] Failed to send email via SES:", error);
      throw error;
    }
  }
}
