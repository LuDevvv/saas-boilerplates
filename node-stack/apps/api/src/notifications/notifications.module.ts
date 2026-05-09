import { Module, Global } from '@nestjs/common';
import { NotificationService as SharedNotificationService } from '@node-stack/notifications';

import { NotificationsController } from '@/notifications/notifications.controller.js';
import { NotificationService } from '@/notifications/notifications.service.js';
import { NotificationProviders } from '@/notifications/notifications.providers.js';
import { RealtimeModule } from '@/realtime/realtime.module.js';

@Global()
@Module({
  imports: [RealtimeModule],
  providers: [
    NotificationProviders,
    {
      provide: SharedNotificationService,
      useFactory: (providers: NotificationProviders) => {
        return new SharedNotificationService({
          userProvider: providers,
          preferenceProvider: providers,
        });
      },
      inject: [NotificationProviders],
    },
    NotificationService,
  ],
  controllers: [NotificationsController],
  exports: [NotificationService, SharedNotificationService],
})
export class NotificationsModule {}
