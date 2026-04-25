import { Injectable, Inject } from "@nestjs/common";
import { Pool } from "pg";
import { POOL_TOKEN } from "@node-stack/db";
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from "prom-client";

@Injectable()
export class MetricsService {
  readonly registry: Registry;

  readonly httpRequestsTotal: Counter<"method" | "path" | "status">;
  readonly httpRequestDurationSeconds: Histogram<"method" | "path">;
  readonly dbConnectionsTotal: Gauge;
  readonly redisConnectionsTotal: Gauge;
  readonly outboxEventsProcessedTotal: Counter;
  readonly emailQueueJobsTotal: Counter<"status">;
  
  readonly dbPoolActiveConnections: Gauge;
  readonly dbPoolIdleConnections: Gauge;
  readonly dbPoolWaitingRequests: Gauge;

  constructor(
    @Inject(POOL_TOKEN) private readonly pool: Pool,
  ) {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry });

    this.httpRequestsTotal = new Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "path", "status"],
      registers: [this.registry],
    });

    this.httpRequestDurationSeconds = new Histogram({
      name: "http_request_duration_seconds",
      help: "HTTP request duration in seconds",
      labelNames: ["method", "path"],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    this.dbPoolActiveConnections = new Gauge({
      name: "db_pool_active_connections",
      help: "Total number of active database connections in the pool",
      registers: [this.registry],
    });

    this.dbPoolIdleConnections = new Gauge({
      name: "db_pool_idle_connections",
      help: "Total number of idle database connections in the pool",
      registers: [this.registry],
    });

    this.dbPoolWaitingRequests = new Gauge({
      name: "db_pool_waiting_requests",
      help: "Total number of database requests waiting for a connection",
      registers: [this.registry],
    });

    this.dbConnectionsTotal = new Gauge({
      name: "db_connections_total",
      help: "Total number of active database connections",
      registers: [this.registry],
    });

    this.redisConnectionsTotal = new Gauge({
      name: "redis_connections_total",
      help: "Total number of active Redis connections",
      registers: [this.registry],
    });

    this.outboxEventsProcessedTotal = new Counter({
      name: "outbox_events_processed_total",
      help: "Total number of outbox events processed",
      registers: [this.registry],
    });

    this.emailQueueJobsTotal = new Counter({
      name: "email_queue_jobs_total",
      help: "Total number of email queue jobs",
      labelNames: ["status"],
      registers: [this.registry],
    });
  }

  async getMetrics(): Promise<string> {
    // Update PG Pool metrics before returning
    this.dbPoolActiveConnections.set(this.pool.totalCount - this.pool.idleCount);
    this.dbPoolIdleConnections.set(this.pool.idleCount);
    this.dbPoolWaitingRequests.set(this.pool.waitingCount);
    
    return this.registry.metrics();
  }
}
