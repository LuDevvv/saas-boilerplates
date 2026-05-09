import { EmailTemplate, EmailSender } from "@node-stack/emails";

export type NotificationChannel = "EMAIL" | "PUSH" | "IN_APP";

export interface NotificationPayload {
  userId: string;
  workspaceId?: string;
  template: EmailTemplate;
  metadata?: Record<string, unknown>;
  channels?: NotificationChannel[];
}

export type ChannelHandler = (payload: NotificationPayload) => Promise<void>;

export type ChannelPreferences = Record<NotificationChannel, boolean>;

export interface IUserProvider {
  getUserEmail(userId: string): Promise<string | null>;
}

export interface IPreferenceProvider {
  getPreferences(userId: string): Promise<ChannelPreferences>;
}

export interface NotificationServiceOptions {
  userProvider: IUserProvider;
  preferenceProvider: IPreferenceProvider;
  emailSender?: EmailSender;
}

export class NotificationService {
  private emailSender: EmailSender;
  private userProvider: IUserProvider;
  private preferenceProvider: IPreferenceProvider;
  private handlers: Partial<Record<NotificationChannel, ChannelHandler>> = {};

  constructor(options: NotificationServiceOptions) {
    this.emailSender = options.emailSender ?? new EmailSender();
    this.userProvider = options.userProvider;
    this.preferenceProvider = options.preferenceProvider;
  }

  setChannelHandler(channel: NotificationChannel, handler: ChannelHandler): void {
    this.handlers[channel] = handler;
  }

  async notify(payload: NotificationPayload): Promise<void> {
    const { userId, channels = ["EMAIL"] } = payload;
    const preferences = await this.preferenceProvider.getPreferences(userId);

    const promises = channels.map(async (channel) => {
      if (!this.isChannelEnabled(channel, preferences)) {
        return;
      }

      try {
        const handler = this.handlers[channel];
        if (handler) {
          await handler(payload);
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

  private async sendEmail(userId: string, template: EmailTemplate): Promise<void> {
    const userEmail = await this.userProvider.getUserEmail(userId);
    if (!userEmail) {
      console.warn(`[NotificationService] No email found for user: ${userId}`);
      return;
    }

    await this.emailSender.sendEmail({
      to: userEmail,
      subject: this.getSubject(template),
      templateName: template.name.toLowerCase(),
      templateData: template.data,
    });
  }

  private getSubject(template: EmailTemplate): string {
    switch (template.name) {
      case "WELCOME":
        return "Welcome to NodeStack!";
      default:
        return "Notification from NodeStack";
    }
  }

  private isChannelEnabled(
    channel: NotificationChannel,
    preferences: ChannelPreferences,
  ): boolean {
    return preferences[channel] !== false;
  }
}
