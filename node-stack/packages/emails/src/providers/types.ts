export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string | string[];
}

export interface EmailProviderResponse {
  messageId?: string;
  raw?: unknown;
}

export interface IEmailProvider {
  name: string;
  sendEmail(options: SendEmailOptions): Promise<EmailProviderResponse>;
}
