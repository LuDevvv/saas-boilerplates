import { Injectable } from "@nestjs/common";
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

  constructor() {
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
    return this.registry.metrics();
  }
}
