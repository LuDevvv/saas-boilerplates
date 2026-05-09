import { Injectable, Inject, Logger } from '@nestjs/common';
import { schema, eq, DB_TOKEN, type Database } from '@node-stack/db';
import { 
  IUserProvider, 
  IPreferenceProvider, 
  ChannelPreferences 
} from '@node-stack/notifications';

@Injectable()
export class NotificationProviders implements IUserProvider, IPreferenceProvider {
  private readonly logger = new Logger(NotificationProviders.name);

  constructor(@Inject(DB_TOKEN) private readonly db: Database) {}

  async getUserEmail(userId: string): Promise<string | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: { email: true },
    });

    if (!user) {
      this.logger.warn(`User ${userId} not found for email resolution`);
      return null;
    }

    return user.email;
  }

  async getPreferences(userId: string): Promise<ChannelPreferences> {
    const settings = await this.db.query.notificationSettings.findFirst({
      where: eq(schema.notificationSettings.userId, userId),
    });

    if (!settings) {
      return {
        EMAIL: true,
        PUSH: true,
        IN_APP: true,
      };
    }

    return {
      EMAIL: settings.emailEnabled,
      PUSH: settings.pushEnabled,
      IN_APP: settings.inAppEnabled,
    };
  }
}
