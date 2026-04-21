import { Controller, Post, Body, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notifications.service.js';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from '../common/guards/admin.guard.js';
import { JwtAuthGuard } from '../auth/guards/jwt.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

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
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.notificationService.listNotifications(userId, workspaceId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.notificationService.markAsRead(id, userId);
    return { success: true };
  }

  @Post('test')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Send a test notification (Admin only)' })
  async sendTestNotification(
    @Body() body: { userId: string; workspaceId?: string; templateName: 'WELCOME' | 'AI_COMPLETED'; data: any }
  ) {
    await this.notificationService.notify({
      userId: body.userId,
      workspaceId: body.workspaceId,
      channels: ['EMAIL', 'IN_APP'],
      template: {
        name: body.templateName,
        data: body.data,
      },
    });
    return { success: true, message: `Test notification sent via Email and In-App (${body.templateName})` };
  }
}
