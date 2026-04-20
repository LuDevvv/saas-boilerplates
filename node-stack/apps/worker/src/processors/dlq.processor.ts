import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, OnModuleDestroy } from '@nestjs/common';

/**
 * Dead Letter Queue processor.
 *
 * Jobs that land here have permanently failed in their origin queue.
 * This processor logs them for observability. In a production system,
 * you could extend this to:
 * - Persist failed jobs to the database for admin review
 * - Send alerts via PagerDuty / Slack / email
 * - Provide a retry-from-DLQ mechanism
 */
@Processor('dlq')
export class DlqProcessor extends WorkerHost implements OnModuleDestroy {
  private readonly logger = new Logger(DlqProcessor.name);

  async process(job: Job): Promise<void> {
    const {
      originalQueue,
      originalJobType,
      originalJobId,
      failedReason,
      attemptsMade,
      failedAt,
    } = job.data;

    this.logger.error(
      `[DLQ] Dead letter received — ` +
      `queue=${originalQueue} type=${originalJobType} ` +
      `originalId=${originalJobId} attempts=${attemptsMade} ` +
      `failedAt=${failedAt} reason="${failedReason}"`,
    );

    // In production, persist to a `dead_letters` table or send an alert:
    // await db.insert(schema.deadLetters).values({ ... });
  }

  async onModuleDestroy() {
    this.logger.log('[DLQ] Gracefully closing DLQ worker...');
    await this.worker.close();
    this.logger.log('[DLQ] Worker closed.');
  }
}
