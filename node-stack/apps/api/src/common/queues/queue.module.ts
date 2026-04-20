import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUE_NAMES, QUEUE_DEFAULT_OPTIONS } from './queue.constants';
import { JobService } from './job.service';

/**
 * Centralized queue module.
 *
 * - Configures BullMQ root connection via ConfigService (no more
 *   scattered `process.env.REDIS_HOST` calls).
 * - Registers all queues with their default job options.
 * - Provides the `JobService` for type-safe job dispatching.
 *
 * This module is @Global, so any module in the API app can inject
 * `JobService` without importing `QueueModule` explicitly.
 */
@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST') || 'localhost',
          port: parseInt(config.get('REDIS_PORT') || '6379', 10),
          password: config.get('REDIS_PASSWORD') || undefined,
          maxRetriesPerRequest: null,
        },
        defaultJobOptions: {
          removeOnComplete: { age: 3600, count: 500 },
          removeOnFail: { age: 172800, count: 1000 },
        },
      }),
    }),
    BullModule.registerQueue(
      {
        name: QUEUE_NAMES.DEFAULT,
        defaultJobOptions: QUEUE_DEFAULT_OPTIONS[QUEUE_NAMES.DEFAULT],
      },
      {
        name: QUEUE_NAMES.AI,
        defaultJobOptions: QUEUE_DEFAULT_OPTIONS[QUEUE_NAMES.AI],
      },
      {
        name: QUEUE_NAMES.NOTIFICATIONS,
        defaultJobOptions: QUEUE_DEFAULT_OPTIONS[QUEUE_NAMES.NOTIFICATIONS],
      },
      {
        name: QUEUE_NAMES.WEBHOOKS_DELIVERY,
        defaultJobOptions: QUEUE_DEFAULT_OPTIONS[QUEUE_NAMES.WEBHOOKS_DELIVERY],
      },
      {
        name: QUEUE_NAMES.OUTBOX,
        defaultJobOptions: QUEUE_DEFAULT_OPTIONS[QUEUE_NAMES.OUTBOX],
      },
      {
        name: QUEUE_NAMES.DLQ,
        defaultJobOptions: QUEUE_DEFAULT_OPTIONS[QUEUE_NAMES.DLQ],
      },
      {
        name: QUEUE_NAMES.PORTABILITY,
        defaultJobOptions: QUEUE_DEFAULT_OPTIONS[QUEUE_NAMES.PORTABILITY],
      },

    ),
  ],
  providers: [JobService],
  exports: [BullModule, JobService],
})
export class QueueModule {}
