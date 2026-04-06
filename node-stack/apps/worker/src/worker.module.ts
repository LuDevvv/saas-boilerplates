import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { OutboxProcessor } from "./processors/outbox.processor";
import { AIProcessor } from "./processors/ai.processor";
import { WebhookProcessor } from "./processors/webhook.processor";
import { WebhookDispatcher } from "./processors/webhook-dispatcher.service";
import { 
  AI_PROVIDER_TOKEN, 
  OpenAIProvider, 
  AnthropicProvider,
  OpenRouterProvider
} from "@node-stack/ai-adapter";
import { CacheModule } from "@node-stack/cache";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
    BullModule.registerQueue(
      { name: "outbox" },
      {
        name: "webhooks.delivery",
        defaultJobOptions: {
          removeOnComplete: true,
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 10000, // 10s
          },
        },
      },
      { name: "ai" }
    ),
  ],
  controllers: [],
  providers: [
    OutboxProcessor, 
    AIProcessor,
    WebhookProcessor,
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
export class WorkerModule {}
