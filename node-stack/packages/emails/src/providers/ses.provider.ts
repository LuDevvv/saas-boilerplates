import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { IEmailProvider, SendEmailOptions, EmailProviderResponse } from "./types.js";

export interface SESProviderOptions {
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export class SESProvider implements IEmailProvider {
  public name = "ses";
  private client: SESClient;

  constructor(options: SESProviderOptions) {
    this.client = new SESClient({
      region: options.region,
      credentials: options.credentials,
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<EmailProviderResponse> {
    const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
    
    const command = new SendEmailCommand({
      Source: options.from,
      Destination: {
        ToAddresses: toAddresses,
      },
      Message: {
        Subject: { Data: options.subject, Charset: "UTF-8" },
        Body: {
          Html: { Data: options.html, Charset: "UTF-8" },
          ...(options.text ? { Text: { Data: options.text, Charset: "UTF-8" } } : {}),
        },
      },
      ...(options.replyTo
        ? { ReplyToAddresses: Array.isArray(options.replyTo) ? options.replyTo : [options.replyTo] }
        : {}),
    });

    try {
      const response = await this.client.send(command);
      return {
        messageId: response.MessageId,
        raw: response,
      };
    } catch (error) {
      console.error("[SESProvider] Failed to send email:", error);
      throw error;
    }
  }
}
