import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger, OnModuleDestroy } from '@nestjs/common';
import { Job } from 'bullmq';
import { DB_TOKEN, schema, type Database } from '@node-stack/db';

@Processor('dlq')
export class DlqProcessor extends WorkerHost implements OnModuleDestroy {
  private readonly logger = new Logger(DlqProcessor.name);

  constructor(@Inject(DB_TOKEN) private readonly db: Database) {
    super();
  }

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

    try {
      await this.db.insert(schema.deadLetters).values({
        originalQueue: originalQueue ?? 'unknown',
        originalJobType: originalJobType ?? 'unknown',
        originalJobId: originalJobId ?? null,
        payload: job.data,
        failedReason: failedReason ?? null,
        attemptsMade: attemptsMade ?? 0,
        failedAt: failedAt ? new Date(failedAt) : new Date(),
      });
    } catch (err) {
      this.logger.error('[DLQ] Failed to persist dead letter to database', err);
    }
  }

  async onModuleDestroy() {
    this.logger.log('[DLQ] Gracefully closing DLQ worker...');
    await this.worker.close();
    this.logger.log('[DLQ] Worker closed.');
  }
}
