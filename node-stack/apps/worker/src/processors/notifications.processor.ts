import { Processor, InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { RequestContextService } from '@node-stack/db';
import { Job, Queue } from 'bullmq';

import { BaseWorker } from '../base.worker.js';

interface SendEmailJobData {
  to: string;
  subject: string;
  template: string;
  data?: Record<string, unknown>;
}

interface SendPushJobData {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Notifications processor — handles email and push notification jobs.
 *
 * Dispatches based on job.name:
 * - "send-email" → Renders template and sends via email provider
 * - "send-push" → Sends push notification (placeholder for future impl)
 */
@Processor('notifications')
export class NotificationsProcessor extends BaseWorker {
  protected readonly logger = new Logger(NotificationsProcessor.name);
  protected readonly queueName = 'notifications';

  constructor(
    @InjectQueue('dlq') private readonly dlqQueue: Queue,
    protected readonly contextService: RequestContextService,
  ) {
    super(contextService);
  }

  protected getDlqQueue(): Queue {
    return this.dlqQueue;
  }

  async processJob(job: Job): Promise<unknown> {
    switch (job.name) {
      case 'send-email':
        return this.handleSendEmail(job as Job<SendEmailJobData>);
      case 'send-push':
        return this.handleSendPush(job as Job<SendPushJobData>);
      default:
        this.logger.warn(`Unknown notification job type: ${job.name}`);
        return null;
    }
  }

  private async handleSendEmail(job: Job<SendEmailJobData>): Promise<boolean> {
    const { to, subject, template, data } = job.data;

    this.logger.log(
      `[Email] Sending email: to=${to} subject="${subject}" template=${template}`,
    );

    try {
      // Initialize the email sender
      const { EmailSender } = await import('@node-stack/emails');
      const emailSender = new EmailSender();

      await emailSender.sendEmail({
        to,
        subject,
        templateName: template,
        templateData: data ?? {},
      });

      this.logger.log(`[Email] Successfully sent to ${to}`);
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`[Email] Failed to send to ${to}: ${message}`);
      throw error;
    }
  }

  private async handleSendPush(job: Job<SendPushJobData>): Promise<boolean> {
    const { userId, title } = job.data;

    this.logger.log(
      `[Push] Sending push notification: userId=${userId} title="${title}"`,
    );

    // Placeholder for push notification implementation
    // In a real app, you would integrate with FCM, APNs, or a service like OneSignal
    this.logger.log(`[Push] Push notification sent to ${userId}`);
    return true;
  }
}
