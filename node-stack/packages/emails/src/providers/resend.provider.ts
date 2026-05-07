import { IEmailProvider, SendEmailOptions, EmailProviderResponse } from "./types.js";

export interface ResendProviderConfig {
  apiKey: string;
}

export class ResendProvider implements IEmailProvider {
  public name = "resend";
  private apiKey: string;
  private apiUrl = "https://api.resend.com/emails";

  constructor(config: ResendProviderConfig) {
    this.apiKey = config.apiKey;
  }

  async sendEmail(options: SendEmailOptions): Promise<EmailProviderResponse> {
    const { to, from, subject, html, text, replyTo } = options;

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from,
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html,
        text: text,
        reply_to: Array.isArray(replyTo) ? replyTo : replyTo ? [replyTo] : undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Resend API error: ${data.message || response.statusText}`);
    }

    return {
      messageId: data.id,
      raw: data,
    };
  }
}
