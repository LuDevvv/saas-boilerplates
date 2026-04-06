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
    
    await this.cacheService.subscribe('internal_events', (message) => {
      try {
        const { type, payload } = JSON.parse(message);
        this.logger.log(`Received cross-process event: ${type}`);
        
        // Forward the Redis event to the local NestJS EventEmitter
        // This decouples the Redis listening from the RealtimeService logic
        this.eventEmitter.emit(type, payload);
      } catch (err) {
        this.logger.error(`Error parsing cross-process event: ${err.message}`);
      }
    });
  }
}
