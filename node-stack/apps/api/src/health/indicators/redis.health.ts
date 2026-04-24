import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { CacheService } from '@node-stack/cache';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly cacheService: CacheService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.cacheService.ping();
      return this.getStatus(key, true);
    } catch (error: any) {
      throw new HealthCheckError(
        'Redis connection failed',
        this.getStatus(key, false, { message: error.message }),
      );
    }
  }
}
