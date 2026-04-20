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

  async onModuleInit() {
    this.logger.log('Initializing Cross-Process Event Bridge via Redis...');
    
    await this.cacheService.psubscribe('internal_events:*', (channel, message) => {
      try {
        const { type, payload } = JSON.parse(message);
        this.logger.log(`Received cross-process event on [${channel}]: ${type}`);
        
        // Forward to local lifecycle
        this.eventEmitter.emit(type, payload);
      } catch (err) {
        this.logger.error(`Error parsing message on [${channel}]: ${err.message}`);
      }
    });
  }
}
