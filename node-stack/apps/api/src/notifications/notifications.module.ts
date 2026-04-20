import { Module, Global } from '@nestjs/common';
import { NotificationService as SharedNotificationService } from '@node-stack/notifications';
import { NotificationService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { RealtimeModule } from '../realtime/realtime.module';

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
