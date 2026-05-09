import { Controller, Post, Body, Get, Param, Patch, Query, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { schema } from '@node-stack/db';
import type { EmailTemplate } from '@node-stack/emails';
import { PaginationDto } from '@node-stack/validators';
import type { PaginatedResponse } from '@node-stack/validators';

import { CurrentUser } from '@/auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard.js';
import { AdminGuard } from '@/common/guards/admin.guard.js';
import { NotificationService } from '@/notifications/notifications.service.js';

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for current user' })
  async listNotifications(
    @CurrentUser('id') userId: string,
    @Query() page: PaginationDto,
    @Query('workspaceId') workspaceId?: string,
  ): Promise<PaginatedResponse<typeof schema.notifications.$inferSelect>> {
    return this.notificationService.listNotifications(userId, {
      workspaceId,
      cursor: page.cursor,
      limit: page.limit,
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  async getUnreadCount(
    @CurrentUser('id') userId: string,
    @Query('workspaceId') workspaceId?: string,
  ): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(userId, workspaceId);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean }> {
    await this.notificationService.markAsRead(id, userId);
    return { success: true };
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(
    @CurrentUser('id') userId: string,
    @Query('workspaceId') workspaceId?: string,
  ): Promise<{ success: boolean }> {
    await this.notificationService.markAllAsRead(userId, workspaceId);
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete/Dismiss a notification' })
  async deleteNotification(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean }> {
    await this.notificationService.deleteNotification(id, userId);
    return { success: true };
  }

  @Post('test')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Send a test notification (Admin only)' })
  async sendTestNotification(
    @Body() body: { userId: string; workspaceId?: string; templateName: 'WELCOME' | 'AI_COMPLETED'; data: Record<string, unknown> }
  ): Promise<{ success: boolean; message: string }> {
    await this.notificationService.notify({
      userId: body.userId,
      workspaceId: body.workspaceId,
      channels: ['EMAIL', 'IN_APP'],
      template: ({ name: body.templateName, data: body.data }) as EmailTemplate,
    });
    return { success: true, message: `Test notification sent via Email and In-App (${body.templateName})` };
  }
}
