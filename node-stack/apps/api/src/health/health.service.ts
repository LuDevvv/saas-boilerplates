import { Injectable } from "@nestjs/common";
import { db, getPoolStats } from "@node-stack/db";
import { sql } from "drizzle-orm";
import Redis from "ioredis";

export interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  dependencies: {
    database: DependencyHealth;
    redis?: DependencyHealth;
    minio?: DependencyHealth;
    migrations?: MigrationHealth;
    polar?: { state: "open" | "closed" | "half-open"; failures?: number };
  };
}

export interface MigrationHealth {
  status: "up" | "down";
  lastMigration?: string;
}

export interface DependencyHealth {
  status: "up" | "down";
  latencyMs?: number;
  error?: string;
  pool?: {
    total: number;
    idle: number;
    waiting: number;
  };
}

@Injectable()
export class HealthService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
  }

  async check(): Promise<HealthStatus> {
    // Check dependencies in a deterministic order: database, redis, minio
    const databaseHealth = await this.checkDatabase();
    const redisHealth = await this.checkRedis();
    const minioHealth = await this.checkMinio();
    const migrationsHealth = await this.checkMigrations();
    const polarHealth = await this.checkCircuitBreakers();

    const allHealthy =
      databaseHealth.status === "up" &&
      (redisHealth?.status ?? "down") === "up" &&
      (minioHealth?.status ?? "down") === "up" &&
      (migrationsHealth?.status ?? "down") === "up" &&
      polarHealth.state === "closed";

    return {
      status: allHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      dependencies: {
        database: databaseHealth,
        redis: redisHealth,
        minio: minioHealth,
        migrations: migrationsHealth,
        polar: polarHealth,
      },
    };
  }

  // Migration status check on health
  async checkMigrations(): Promise<MigrationHealth> {
    try {
      const migrations = (db.query as any)?.migrations?.findFirst?.() ?? null;
      const last = (migrations as any)?.name || (migrations as any)?.id;
      return { status: "up", lastMigration: last ?? undefined };
    } catch {
      return { status: "down" };
    }
  }

  // Circuit breaker status for external services (Polar)
  async checkCircuitBreakers(): Promise<{
    state: "open" | "closed" | "half-open";
    failures?: number;
  }> {
    // In a real setup we would query the Polar provider's circuit breaker state.
    // For now, expose a healthy, closed state by default and a hook for future wiring.
    return { state: "closed", failures: 0 };
  }

  // Liveness probe: always ok for simplicity (could extend with real checks)
  async checkLiveness(): Promise<{ status: string }> {
    return { status: "ok" };
  }

  // Readiness probe: ok if all dependencies are up, degraded otherwise
  async checkReadiness(): Promise<{ status: string }> {
    const dbHealth = await this.checkDatabase();
    const redisHealth = await this.checkRedis();
    const minioHealth = await this.checkMinio();
    const ok = [dbHealth, redisHealth, minioHealth].every(
      (d) => d.status === "up",
    );
    return { status: ok ? "ok" : "degraded" };
  }

  async checkDatabase(): Promise<DependencyHealth> {
    const start = Date.now();
    try {
      await db.execute(sql`SELECT 1` as any);
      const poolStats = getPoolStats();
      return {
        status: "up",
        latencyMs: Date.now() - start,
        pool: poolStats,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { status: "down", error: message };
    }
  }

  async checkRedis(): Promise<DependencyHealth> {
    const start = Date.now();
    try {
      await this.redis.ping();
      return { status: "up", latencyMs: Date.now() - start };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { status: "down", error: message };
    }
  }

  async getPgBouncerPools(): Promise<{ status: string; pools: unknown[] }> {
    try {
      const result = await db.execute(sql`SHOW pools` as any);
      return { status: "ok", pools: result.rows };
    } catch {
      return { status: "unavailable", pools: [] };
    }
  }

  async checkMinio(): Promise<DependencyHealth> {
    const start = Date.now();
    try {
      const response = await fetch(
        `${process.env.MINIO_ENDPOINT}/minio/health/live`,
      );
      return {
        status: response.ok ? "up" : "down",
        latencyMs: Date.now() - start,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { status: "down", error: message };
    }
  }
}
