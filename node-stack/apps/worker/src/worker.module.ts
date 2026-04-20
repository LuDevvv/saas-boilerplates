import { BullModule, InjectQueue } from "@nestjs/bullmq";
import { Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";

import { OutboxProcessor } from "./processors/outbox.processor";
import { AIProcessor } from "./processors/ai.processor";
import { WebhookProcessor } from "./processors/webhook.processor";
import { WebhookDispatcher } from "./processors/webhook-dispatcher.service";
import { NotificationsProcessor } from "./processors/notifications.processor";
import { DlqProcessor } from "./processors/dlq.processor";
import { PortabilityProcessor } from "./processors/portability.processor";
import { SystemProcessor } from "./processors/system.processor";
import { PortabilityExporter } from "@node-stack/services";
import { createStorageProvider } from "@node-stack/storage";
import { 
  AI_PROVIDER_TOKEN, 
  OpenAIProvider, 
  AnthropicProvider,
  OpenRouterProvider
} from "@node-stack/ai-adapter";
import { CacheModule } from "@node-stack/cache";

/**
 * Worker module — registers all BullMQ queues and processors.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST') || 'localhost',
          port: parseInt(config.get('REDIS_PORT') || '6379', 10),
          password: config.get('REDIS_PASSWORD') || undefined,
          maxRetriesPerRequest: null,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'default' },
      { name: 'ai' },
      { name: 'notifications' },
      { name: 'webhooks.delivery' },
      { name: 'outbox' },
      { name: 'dlq' },
      {
        name: 'portability',
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: { age: 86400, count: 100 },
        },
      },
      {
        name: 'system',
        defaultJobOptions: {
          attempts: 1,
          removeOnComplete: true,
        },
      },
    ),
  ],
  providers: [
    OutboxProcessor, 
    AIProcessor,
    WebhookProcessor,
    NotificationsProcessor,
    DlqProcessor,
    PortabilityProcessor,
    SystemProcessor,
    PortabilityExporter,
    {
      provide: "STORAGE_SERVICE",
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = (config.get('STORAGE_PROVIDER', 'local')).toLowerCase() as "s3" | "local";
        if (provider === "s3") {
          return createStorageProvider({
            provider: "s3",
            s3: {
              endpoint: config.get('STORAGE_S3_ENDPOINT') || config.get('MINIO_ENDPOINT'),
              region: config.get('STORAGE_S3_REGION', 'us-east-1'),
              accessKeyId: config.get('STORAGE_S3_ACCESS_KEY') || config.get('MINIO_ACCESS_KEY') || '',
              secretAccessKey: config.get('STORAGE_S3_SECRET_KEY') || config.get('MINIO_SECRET_KEY') || '',
              bucket: config.get('STORAGE_S3_BUCKET') || config.get('MINIO_BUCKET') || 'attachments',
              publicUrl: config.get('STORAGE_S3_PUBLIC_URL') || config.get('MINIO_PUBLIC_URL'),
            },
          });
        }
        return createStorageProvider({
          provider: "local",
          local: {
            basePath: config.get('STORAGE_LOCAL_PATH', './storage'),
            baseUrl: config.get('STORAGE_LOCAL_URL', 'http://localhost:3000/api/storage'),
          },
        });
      },
    },
    WebhookDispatcher,
    {
      provide: AI_PROVIDER_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = config.get('AI_PROVIDER', 'openai');
        switch (provider) {
          case 'anthropic':
            return new AnthropicProvider(config.getOrThrow('ANTHROPIC_API_KEY'));
          case 'openrouter':
            return new OpenRouterProvider(config.getOrThrow('OPENROUTER_API_KEY'));
          case 'openai':
          default:
            return new OpenAIProvider(config.getOrThrow('OPENAI_API_KEY'));
        }
      },
    }
  ],
})
export class WorkerModule implements OnModuleInit {
  constructor(
    @InjectQueue("system") private readonly systemQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.systemQueue.add(
      "cleanup-portability",
      {},
      {
        repeat: { pattern: "0 0 * * *" },
        jobId: "portability-cleanup-cron",
      },
    );
  }
}
