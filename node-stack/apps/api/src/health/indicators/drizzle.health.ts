import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { db } from '@node-stack/db';
import { sql } from 'drizzle-orm';

@Injectable()
export class DrizzleHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Execute a simple query to verify connection
      await (db as any).execute(sql`SELECT 1`);
      return this.getStatus(key, true);
    } catch (error: any) {
      throw new HealthCheckError(
        'Drizzle connection failed',
        this.getStatus(key, false, { message: error.message }),
      );
    }
  }
}
