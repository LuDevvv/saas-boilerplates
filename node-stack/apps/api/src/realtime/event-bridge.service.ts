import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CacheService } from '@node-stack/cache';

@Injectable()
export class EventBridgeService implements OnModuleInit {
  private readonly logger = new Logger(EventBridgeService.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing Cross-Process Event Bridge via Redis...');

    await this.cacheService.psubscribe('internal_events:*', (channel: string, message: string) => {
      try {
        const parsed = JSON.parse(message) as { type: string; payload: unknown };
        this.logger.log(`Received cross-process event on [${channel}]: ${parsed.type}`);

        // Forward to local lifecycle
        this.eventEmitter.emit(parsed.type, parsed.payload);
      } catch (err: unknown) {
        this.logger.error(`Error parsing message on [${channel}]: ${(err as Error).message}`);
      }
    });
  }
}
