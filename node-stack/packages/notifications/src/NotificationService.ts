import { EmailTemplate, EmailSender } from "@node-stack/emails";

export type NotificationChannel = "EMAIL" | "PUSH" | "IN_APP";

export interface NotificationPayload {
  userId: string;
  workspaceId?: string;
  template: EmailTemplate;
  metadata?: Record<string, any>;
  channels?: NotificationChannel[];
}

export type ChannelHandler = (payload: NotificationPayload) => Promise<void>;

export class NotificationService {
  private emailSender: EmailSender;
  private handlers: Partial<Record<NotificationChannel, ChannelHandler>> = {};

  constructor() {
    this.emailSender = new EmailSender();
  }

  setChannelHandler(channel: NotificationChannel, handler: ChannelHandler) {
    this.handlers[channel] = handler;
  }

  async notify(payload: NotificationPayload): Promise<void> {
    const { userId, channels = ["EMAIL"] } = payload;
    const preferences = await this.getUserPreferences(userId);

    const promises = channels.map(async (channel) => {
      if (!this.isChannelEnabled(channel, preferences)) {
        return;
      }

      try {
        // If a custom handler is registered, use it
        if (this.handlers[channel]) {
          await this.handlers[channel]!(payload);
          return;
        }

        switch (channel) {
          case "EMAIL":
            await this.sendEmail(userId, payload.template);
            break;
          default:
            console.warn(`[NotificationService] No handler for channel: ${channel}`);
        }
      } catch (error) {
        console.error(`[NotificationService] Failed to send via ${channel}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }


  private async sendEmail(userId: string, template: EmailTemplate) {
    // 1. Get user email (placeholder logic)
    const userEmail = await this.getUserEmail(userId);

    // 2. Wrap the new renderEmail into the legacy sender for now
    // or use the provider directly if we refactor more.
    await this.emailSender.sendEmail({
      to: userEmail,
      subject: this.getSubject(template),
      templateName: template.name.toLowerCase(),
      templateData: template.data,
    });
  }

  private getSubject(template: EmailTemplate): string {
    switch (template.name) {
      case "WELCOME": return "Welcome to NodeStack!";
      default: return "Notification from NodeStack";
    }
  }

  private async getUserEmail(userId: string): Promise<string> {
    // In a real app, this would query the DB
    return `user_${userId}@example.com`;
  }

  private async getUserPreferences(userId: string) {
    return {
      EMAIL: true,
      PUSH: true,
      IN_APP: true,
    };
  }

  private isChannelEnabled(channel: NotificationChannel, preferences: any): boolean {
    return preferences[channel] !== false;
  }
}
