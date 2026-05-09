import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Inject, OnModuleInit } from "@nestjs/common";
import { POOL_TOKEN } from "@node-stack/db";
import { metricsEvents, METRIC_EVENTS } from "@node-stack/utils";
import { Queue } from "bullmq";
import { Pool } from "pg";
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from "prom-client";

import { QUEUE_NAMES } from "@/common/queues/queue.constants.js";

@Injectable()
export class MetricsService implements OnModuleInit {
  readonly registry: Registry;

  readonly httpRequestsTotal: Counter<"method" | "path" | "status">;
  readonly httpRequestDurationSeconds: Histogram<"method" | "path">;
  readonly dbQueryDurationSeconds: Histogram<"type">;
  readonly cacheOperationsTotal: Counter<"result">;
  readonly dbConnectionsTotal: Gauge;
  readonly redisConnectionsTotal: Gauge;
  readonly outboxEventsProcessedTotal: Counter;
  readonly emailQueueJobsTotal: Counter<"status">;
  
  readonly dbPoolActiveConnections: Gauge;
  readonly dbPoolIdleConnections: Gauge;
  readonly dbPoolWaitingRequests: Gauge;

  readonly queueJobsTotal: Gauge<"queue" | "status">;

  constructor(
    @Inject(POOL_TOKEN) private readonly pool: Pool,
    @InjectQueue(QUEUE_NAMES.DEFAULT) private readonly defaultQueue: Queue,
    @InjectQueue(QUEUE_NAMES.AI) private readonly aiQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private readonly notificationsQueue: Queue,
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

    this.dbQueryDurationSeconds = new Histogram({
      name: "db_query_duration_seconds",
      help: "Database query duration in seconds",
      labelNames: ["type"],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
      registers: [this.registry],
    });

    this.cacheOperationsTotal = new Counter({
      name: "cache_operations_total",
      help: "Total number of cache operations (hit/miss)",
      labelNames: ["result"],
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

    this.queueJobsTotal = new Gauge({
      name: "queue_jobs_total",
      help: "Total number of jobs in the queue by status",
      labelNames: ["queue", "status"],
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

  onModuleInit(): void {
    // Subscribe to cross-package metric events
    metricsEvents.on(METRIC_EVENTS.CACHE_HIT, () => {
      this.cacheOperationsTotal.inc({ result: "hit" });
    });

    metricsEvents.on(METRIC_EVENTS.CACHE_MISS, () => {
      this.cacheOperationsTotal.inc({ result: "miss" });
    });

    metricsEvents.on(METRIC_EVENTS.DB_QUERY_DURATION, (payload: { durationSeconds: number; queryType?: string }) => {
      this.dbQueryDurationSeconds.observe({ type: payload.queryType ?? "unknown" }, payload.durationSeconds);
    });
  }

  async getMetrics(): Promise<string> {
    // Update PG Pool metrics before returning
    this.dbPoolActiveConnections.set(this.pool.totalCount - this.pool.idleCount);
    this.dbPoolIdleConnections.set(this.pool.idleCount);
    this.dbPoolWaitingRequests.set(this.pool.waitingCount);

    // Update Queue metrics
    const queues = [
      { name: QUEUE_NAMES.DEFAULT, queue: this.defaultQueue },
      { name: QUEUE_NAMES.AI, queue: this.aiQueue },
      { name: QUEUE_NAMES.NOTIFICATIONS, queue: this.notificationsQueue },
    ];

    for (const { name, queue } of queues) {
      const counts = await queue.getJobCounts(
        "active",
        "waiting",
        "completed",
        "failed",
        "delayed",
        "paused",
      );

      this.queueJobsTotal.set({ queue: name, status: "active" }, counts.active ?? 0);
      this.queueJobsTotal.set({ queue: name, status: "waiting" }, counts.waiting ?? 0);
      this.queueJobsTotal.set({ queue: name, status: "completed" }, counts.completed ?? 0);
      this.queueJobsTotal.set({ queue: name, status: "failed" }, counts.failed ?? 0);
      this.queueJobsTotal.set({ queue: name, status: "delayed" }, counts.delayed ?? 0);
    }
    
    return this.registry.metrics();
  }
}
