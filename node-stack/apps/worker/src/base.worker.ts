import { WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleDestroy, Injectable } from '@nestjs/common';
import { RequestContextService } from '@node-stack/db';
import { Job, Queue } from 'bullmq';

@Injectable()
export abstract class BaseWorker extends WorkerHost implements OnModuleDestroy {
  constructor(protected readonly contextService: RequestContextService) {
    super();
  }
  protected abstract readonly logger: Logger;
  protected abstract readonly queueName: string;

  /** Override in subclass to get a reference to the DLQ queue, if available. */
  protected getDlqQueue(): Queue | null {
    return null;
  }

  /**
   * Implement this in the concrete processor.
   * Return any value to mark the job as successful.
   * Throw to trigger retry / DLQ forwarding.
   */
  protected abstract processJob(job: Job): Promise<unknown>;

  /**
   * BullMQ entry point — delegates to processJob() with
   * structured logging, timing, and DLQ forwarding.
   */
  async process(job: Job): Promise<unknown> {
    const startMs = Date.now();
    this.logger.log(
      `[${this.queueName}] Processing job ${job.id} (${job.name}) attempt=${job.attemptsMade + 1}`,
    );

    const jobData = job.data as Record<string, unknown>;
    const jobPayload = jobData?.payload as Record<string, unknown> | undefined;
    const workspaceId = (jobData?.workspaceId ?? jobPayload?.workspaceId) as string | undefined;
    const userId = (jobData?.userId ?? jobPayload?.userId) as string | undefined;

    return await this.contextService.run({ workspaceId, userId }, async () => {
      try {
        const result = await this.processJob(job);
        this.logger.log(
          `[${this.queueName}] Job ${job.id} completed in ${Date.now() - startMs}ms`,
        );
        return result;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const durationMs = Date.now() - startMs;

        // Check if all retries are exhausted
        const maxAttempts = job.opts?.attempts ?? 0;
        const isLastAttempt = job.attemptsMade + 1 >= maxAttempts;

        if (isLastAttempt && maxAttempts > 0) {
          this.logger.error(
            `[${this.queueName}] Job ${job.id} PERMANENTLY FAILED after ${job.attemptsMade + 1} attempts (${durationMs}ms): ${errorMessage}`,
          );
          await this.forwardToDeadLetterQueue(job, errorMessage);
        } else {
          this.logger.warn(
            `[${this.queueName}] Job ${job.id} failed (attempt ${job.attemptsMade + 1}/${maxAttempts}, ${durationMs}ms): ${errorMessage}`,
          );
        }

        throw error; // Let BullMQ handle the retry
      }
    });
  }

  /**
   * Graceful shutdown — called by NestJS when app.close() is invoked.
   * Stops accepting new jobs and waits for active jobs to finish.
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log(`[${this.queueName}] Gracefully closing worker...`);
    await this.worker.close();
    this.logger.log(`[${this.queueName}] Worker closed.`);
  }

  /**
   * Forward a permanently-failed job to the DLQ for manual inspection.
   */
  private async forwardToDeadLetterQueue(job: Job, failedReason: string): Promise<void> {
    const dlqQueue = this.getDlqQueue();
    if (!dlqQueue) {
      this.logger.warn(
        `[${this.queueName}] No DLQ configured — job ${job.id} data will only be in BullMQ failed set.`,
      );
      return;
    }

    try {
      await dlqQueue.add('dead-letter', {
        originalQueue: this.queueName,
        originalJobType: job.name,
        originalJobId: String(job.id),
        payload: job.data as unknown,
        failedReason,
        attemptsMade: job.attemptsMade + 1,
        failedAt: new Date().toISOString(),
      });
      this.logger.log(`[${this.queueName}] Job ${job.id} forwarded to DLQ.`);
    } catch (dlqError) {
      this.logger.error(
        `[${this.queueName}] Failed to forward job ${job.id} to DLQ: ${dlqError}`,
      );
    }
  }
}
