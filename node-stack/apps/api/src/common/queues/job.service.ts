import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue, Job, JobsOptions } from 'bullmq';

import {
  QUEUE_NAMES,
  JOB_TYPES,
  type AIJobPayload,
  type EmailJobPayload,
  type PushNotificationPayload,
  type WebhookDeliveryPayload,
  type OutboxJobPayload,
  type PortabilityJobPayload,
} from '@/common/queues/queue.constants.js';

/**
 * Type-safe job dispatcher.
 *
 * Controllers and services inject this instead of raw `Queue` instances.
 * Job payloads are validated at compile time via TypeScript generics.
 *
 * @example
 * // In a controller:
 * const job = await this.jobService.addAIJob({
 *   jobType: 'summarize-document',
 *   prompt: 'Summarize this...',
 *   workspaceId: '...',
 *   userId: '...',
 * });
 * return { jobId: job.id, status: 'queued' };
 */
@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.DEFAULT) private readonly defaultQueue: Queue,
    @InjectQueue(QUEUE_NAMES.AI) private readonly aiQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private readonly notificationsQueue: Queue,
    @InjectQueue(QUEUE_NAMES.WEBHOOKS_DELIVERY) private readonly webhooksQueue: Queue,
    @InjectQueue(QUEUE_NAMES.OUTBOX) private readonly outboxQueue: Queue,
    @InjectQueue(QUEUE_NAMES.PORTABILITY) private readonly portabilityQueue: Queue,
    @InjectQueue(QUEUE_NAMES.DLQ) private readonly dlqQueue: Queue,
  ) {}

  // ─── AI ─────────────────────────────────────────────────────────────
  async addAIJob(payload: AIJobPayload, opts?: JobsOptions): Promise<Job> {
    this.logger.debug(`Enqueuing AI job: type=${payload.jobType} workspace=${payload.workspaceId}`);
    return this.aiQueue.add(JOB_TYPES.AI_PROCESS, payload, opts);
  }

  // ─── Notifications ──────────────────────────────────────────────────
  async addEmailJob(payload: EmailJobPayload, opts?: JobsOptions): Promise<Job> {
    this.logger.debug(`Enqueuing email job: to=${payload.to} template=${payload.template}`);
    return this.notificationsQueue.add(JOB_TYPES.SEND_EMAIL, payload, opts);
  }

  async addPushJob(payload: PushNotificationPayload, opts?: JobsOptions): Promise<Job> {
    this.logger.debug(`Enqueuing push notification: userId=${payload.userId}`);
    return this.notificationsQueue.add(JOB_TYPES.SEND_PUSH, payload, opts);
  }

  // ─── Webhooks ───────────────────────────────────────────────────────
  async addWebhookDelivery(payload: WebhookDeliveryPayload, opts?: JobsOptions): Promise<Job> {
    this.logger.debug(`Enqueuing webhook delivery: endpointId=${payload.endpointId}`);
    return this.webhooksQueue.add(JOB_TYPES.DELIVER_WEBHOOK, payload, {
      ...opts,
      jobId: opts?.jobId ?? `webhook-${payload.endpointId}-${Date.now()}`,
    });
  }

  // ─── Outbox ─────────────────────────────────────────────────────────
  async addOutboxJob(payload: OutboxJobPayload, opts?: JobsOptions): Promise<Job> {
    this.logger.debug(`Enqueuing outbox processing: outboxId=${payload.outboxId}`);
    return this.outboxQueue.add(JOB_TYPES.PROCESS_OUTBOX, payload, opts);
  }

  // ─── Portability ───────────────────────────────────────────────────
  async addPortabilityJob(payload: PortabilityJobPayload, opts?: JobsOptions): Promise<Job> {
    this.logger.debug(`Enqueuing portability job: requestId=${payload.requestId}`);
    return this.portabilityQueue.add(JOB_TYPES.PROCESS_PORTABILITY, payload, opts);
  }

  // ─── Dead Letter Queue ──────────────────────────────────────────────
  async addToDeadLetterQueue(
    originalQueue: string,
    originalJobType: string,
    originalJobId: string,
    payload: unknown,
    failedReason: string,
    attemptsMade: number,
  ): Promise<Job> {
    this.logger.warn(
      `Moving job to DLQ: queue=${originalQueue} type=${originalJobType} id=${originalJobId} reason=${failedReason}`,
    );
    return this.dlqQueue.add(JOB_TYPES.DEAD_LETTER, {
      originalQueue,
      originalJobType,
      originalJobId,
      payload,
      failedReason,
      attemptsMade,
      failedAt: new Date().toISOString(),
    });
  }

  // ─── Job Tracking ──────────────────────────────────────────────────
  async getJobStatus(queueName: string, jobId: string) {
    const queue = this.getQueueByName(queueName);
    if (!queue) return null;

    const job = await queue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    return {
      id: job.id,
      queue: queueName,
      name: job.name,
      state,
      progress: job.progress,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      returnvalue: job.returnvalue,
      timestamp: job.timestamp,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
    };
  }

  async getQueueStats(queueName: string) {
    const queue = this.getQueueByName(queueName);
    if (!queue) return null;

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      queue: queueName,
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  private getQueueByName(name: string): Queue | null {
    const map: Record<string, Queue> = {
      [QUEUE_NAMES.DEFAULT]: this.defaultQueue,
      [QUEUE_NAMES.AI]: this.aiQueue,
      [QUEUE_NAMES.NOTIFICATIONS]: this.notificationsQueue,
      [QUEUE_NAMES.WEBHOOKS_DELIVERY]: this.webhooksQueue,
      [QUEUE_NAMES.OUTBOX]: this.outboxQueue,
      [QUEUE_NAMES.PORTABILITY]: this.portabilityQueue,
      [QUEUE_NAMES.DLQ]: this.dlqQueue,
    };
    return map[name] ?? null;
  }
}
