import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { schema, eq, desc, and, lt, or, DB_TOKEN, type Database } from '@node-stack/db';
import { NotificationService as SharedNotificationService, NotificationPayload } from '@node-stack/notifications';
import { encodeCursor, decodeCursor } from '@node-stack/utils';
import { buildPage, type PaginatedResponse } from '@node-stack/validators';

import { RealtimeService } from '@/realtime/realtime.service.js';

interface NotificationCursor extends Record<string, unknown> {
  createdAt: string;
  id: string;
}

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(DB_TOKEN) private readonly db: Database,
    private readonly sharedNotificationService: SharedNotificationService,
    private readonly realtimeService: RealtimeService,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing API Notification handlers (Persistence + Realtime)');
    
    // Register the IN_APP channel handler
    this.sharedNotificationService.setChannelHandler('IN_APP', async (payload) => {
      await this.handleInAppNotification(payload);
    });
  }

  @OnEvent('ai_job.completed')
  async handleAiJobCompleted(payload: { userId: string; workspaceId: string; jobId: string; result: any }) {
    await this.notify({
      userId: payload.userId,
      workspaceId: payload.workspaceId,
      channels: ['IN_APP'],
      template: {
        name: 'AI_COMPLETED',
        data: {
          jobId: payload.jobId,
          message: 'Your AI job has finished processing.',
        },
      },
    });
  }

  private async handleInAppNotification(payload: NotificationPayload) {
    const { userId, workspaceId, template } = payload;
    
    this.logger.log(`Handling IN_APP notification for user ${userId}`);

    // 1. Persist to DB
    const [notification] = await this.db.insert(schema.notifications).values({
      userId,
      workspaceId,
      type: template.name,
      title: this.getSubject(template.name), // Basic subject logic
      body: JSON.stringify(template.data), // In a real app, this would be rendered or store template key
      data: template.data,
    }).returning();

    // 2. Emit Realtime
    this.realtimeService.emitToUser(userId, 'notification.created', {
      notification,
    });

    if (workspaceId) {
      this.realtimeService.emitToWorkspace(workspaceId, 'notification.created', {
        notification,
      });
    }
  }

  private getSubject(templateName: string): string {
    switch (templateName) {
      case 'WELCOME': return 'Welcome to the platform!';
      case 'AI_COMPLETED': return 'AI Task Completed';
      default: return 'New Alert';
    }
  }

  // Wrapper methods for the controller/other services
  async notify(payload: NotificationPayload) {
    return this.sharedNotificationService.notify(payload);
  }

  async listNotifications(
    userId: string,
    options: { workspaceId?: string; cursor?: string; limit?: number } = {},
  ): Promise<PaginatedResponse<typeof schema.notifications.$inferSelect>> {
    const limit = options.limit ?? 20;
    const decoded = options.cursor
      ? decodeCursor<NotificationCursor>(options.cursor)
      : null;

    // Compound (createdAt DESC, id DESC) cursor: a row "comes after"
    // the cursor row when its createdAt is older, OR createdAt ties
    // and id is lower. Without the id tiebreaker, equal-timestamp
    // rows can repeat across pages.
    const cursorPredicate = decoded
      ? or(
          lt(schema.notifications.createdAt, new Date(decoded.createdAt)),
          and(
            eq(schema.notifications.createdAt, new Date(decoded.createdAt)),
            lt(schema.notifications.id, decoded.id),
          ),
        )
      : undefined;

    const rows = await this.db.query.notifications.findMany({
      where: and(
        eq(schema.notifications.userId, userId),
        options.workspaceId
          ? eq(schema.notifications.workspaceId, options.workspaceId)
          : undefined,
        cursorPredicate,
      ),
      orderBy: [desc(schema.notifications.createdAt), desc(schema.notifications.id)],
      limit: limit + 1,
    });

    return buildPage(rows, limit, (row) =>
      encodeCursor({ createdAt: row.createdAt.toISOString(), id: row.id }),
    );
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.db
      .update(schema.notifications)
      .set({ readAt: new Date() })
      .where(and(
        eq(schema.notifications.id, notificationId),
        eq(schema.notifications.userId, userId)
      ));
  }

  async markAllAsRead(userId: string, workspaceId?: string) {
    return this.db
      .update(schema.notifications)
      .set({ readAt: new Date() })
      .where(and(
        eq(schema.notifications.userId, userId),
        workspaceId ? eq(schema.notifications.workspaceId, workspaceId) : undefined
      ));
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.db
      .delete(schema.notifications)
      .where(and(
        eq(schema.notifications.id, notificationId),
        eq(schema.notifications.userId, userId)
      ));
  }
}
