import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiController } from './ai.controller';
import { CacheModule } from '@node-stack/cache';

@Module({
  imports: [
    CacheModule,
    BullModule.registerQueue({
      name: 'ai',
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
  ],
  controllers: [AiController],
})
export class AiModule {}
