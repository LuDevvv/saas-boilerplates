import { Module, Global } from '@nestjs/common';
import { NotificationService as SharedNotificationService } from '@node-stack/notifications';
import { NotificationService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';
import { RealtimeModule } from '../realtime/realtime.module.js';

@Global()
@Module({
  imports: [RealtimeModule],
  providers: [
    {
      provide: SharedNotificationService,
      useFactory: () => new SharedNotificationService(),
    },
    NotificationService,
  ],
  controllers: [NotificationsController],
  exports: [NotificationService, SharedNotificationService],
})
export class NotificationsModule {}
