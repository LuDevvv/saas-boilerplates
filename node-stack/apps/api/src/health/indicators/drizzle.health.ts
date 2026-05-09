import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { db } from '@node-stack/db';
import { sql } from 'drizzle-orm';

type DrizzleDb = { execute: (query: unknown) => Promise<unknown> };

@Injectable()
export class DrizzleHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Execute a simple query to verify connection
      await (db as unknown as DrizzleDb).execute(sql`SELECT 1`);
      return this.getStatus(key, true);
    } catch (error) {
      const err = error as Error;
      throw new HealthCheckError(
        'Drizzle connection failed',
        this.getStatus(key, false, { message: err.message }),
      );
    }
  }
}
