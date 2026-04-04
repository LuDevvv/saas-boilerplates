# Observability Documentation

## 1. Observability Overview

The Node.js SaaS Backend implements comprehensive observability with structured logging, metrics, and distributed tracing.

---

## 2. Structured Logging

### 2.1 Log Format

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "User registered successfully",
  "context": {
    "requestId": "req-abc123",
    "userId": "user-xyz789",
    "workspaceId": "ws-111222",
    "email": "user@example.com"
  },
  "service": "auth-service",
  "version": "1.0.0",
  "environment": "production"
}
```

### 2.2 Logger Service Implementation

```typescript
// packages/observability/src/logger.service.ts
import { Injectable, LoggerService as NestLoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";

export interface LogContext {
  requestId?: string;
  userId?: string;
  workspaceId?: string;
  correlationId?: string;
  [key: string]: any;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isProduction =
      this.configService.get<string>("NODE_ENV") === "production";
  }

  log(message: string, context?: LogContext): void {
    this.write("info", message, context);
  }

  error(message: string, trace?: string, context?: LogContext): void {
    this.write("error", message, { ...context, trace });
  }

  warn(message: string, context?: LogContext): void {
    this.write("warn", message, context);
  }

  debug(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      this.write("debug", message, context);
    }
  }

  verbose(message: string, context?: LogContext): void {
    if (!this.isProduction) {
      this.write("verbose", message, context);
    }
  }

  private write(
    level: "info" | "warn" | "error" | "debug" | "verbose",
    message: string,
    context?: LogContext,
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
      service: "node-saas-api",
      version: "1.0.0",
    };

    if (this.isProduction) {
      console.log(JSON.stringify(logEntry));
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, context || "");
    }
  }
}
```

### 2.3 Log Levels

| Level       | Usage                          | Example                           |
| ----------- | ------------------------------ | --------------------------------- |
| **error**   | Application errors, exceptions | Database connection failed        |
| **warn**    | Deprecations, warnings         | Using deprecated API              |
| **info**    | Business events                | User registered, Payment received |
| **debug**   | Request details                | Request body, headers             |
| **verbose** | Function entry/exit            | Entering function X               |

### 2.4 Request Correlation

```typescript
// apps/api/src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { v4 as uuidv4 } from "uuid";
import { LoggerService } from "./logger.service";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const requestId = request.headers["x-request-id"] || uuidv4();
    const startTime = Date.now();

    response.setHeader("x-request-id", requestId);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(`${request.method} ${request.url}`, {
            requestId,
            method: request.method,
            path: request.url,
            statusCode: response.statusCode,
            duration,
            userId: request.user?.id,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `${request.method} ${request.url} - Error`,
            error.stack,
            {
              requestId,
              method: request.method,
              path: request.url,
              statusCode: response.statusCode,
              duration,
              userId: request.user?.id,
            },
          );
        },
      }),
    );
  }
}
```

---

## 3. Metrics

### 3.1 Key Metrics

#### HTTP Metrics

```typescript
// Request duration histogram
http_request_duration_seconds{
  method="GET",
  path="/api/v1/users",
  status="200"
}
```

#### Business Metrics

```typescript
// Active users gauge
active_users_total{workspace="ws-123"}
```

#### Infrastructure Metrics

```typescript
// Database connections
db_connections_active{pool="default"}
```

### 3.2 Metrics Implementation

```typescript
// packages/observability/src/metrics.service.ts
import { Counter, Histogram, Gauge } from "prom-client";

export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "path", "status"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10],
});

export const httpRequestTotal = new Counter({
  name: "http_request_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status"],
});

export const activeUsers = new Gauge({
  name: "active_users_total",
  help: "Number of active users",
  labelNames: ["workspace"],
});

export const dbQueryDuration = new Histogram({
  name: "db_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["operation", "table"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
});

export const jobProcessedTotal = new Counter({
  name: "job_processed_total",
  help: "Total number of processed jobs",
  labelNames: ["queue", "status"],
});
```

### 3.3 Metrics Endpoint

```typescript
// apps/api/src/metrics/metrics.controller.ts
import { Controller, Get } from "@nestjs/common";
import { Registry } from "prom-client";

@Controller("metrics")
export class MetricsController {
  private readonly registry: Registry;

  constructor() {
    this.registry = new Registry();
  }

  @Get()
  async getMetrics() {
    this.registry.setDefaultLabels({ app: "node-saas-api" });

    return this.registry.metrics();
  }
}
```

---

## 4. Distributed Tracing

### 4.1 OpenTelemetry Setup

```typescript
// packages/observability/src/tracing.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { Resource } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

export function initTracing(
  serviceName: string,
  jaegerEndpoint: string,
): NodeSDK {
  const sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: "1.0.0",
    }),
    traceExporter: new JaegerExporter({
      endpoint: jaegerEndpoint,
    }),
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new PgInstrumentation(),
    ],
  });

  sdk.start();

  process.on("SIGTERM", () => {
    sdk.shutdown().catch(console.error);
  });

  return sdk;
}
```

### 4.2 Trace Context Propagation

```typescript
// Inject trace context into outgoing requests
import { context, trace } from "@opentelemetry/api";

function injectTraceContext(headers: Record<string, string>): void {
  const currentSpan = trace.getSpan(context.active());
  if (currentSpan) {
    const spanContext = currentSpan.spanContext();
    headers["traceparent"] =
      `00-${spanContext.traceId}-${spanContext.spanId}-01`;
  }
}
```

---

## 5. Health Checks

### 5.1 Health Check Endpoint

```typescript
// apps/api/src/health/health.controller.ts
import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Redis } from "ioredis";

@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: Redis,
  ) {}

  @Get()
  async check() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const status = checks.every((c) => c.status === "fulfilled")
      ? "ok"
      : "degraded";

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database: checks[0].status === "fulfilled" ? "up" : "down",
        redis: checks[1].status === "fulfilled" ? "up" : "down",
      },
    };
  }

  private async checkDatabase() {
    await this.prisma.$queryRaw`SELECT 1`;
  }

  private async checkRedis() {
    await this.redis.ping();
  }
}
```

### 5.2 Liveness vs Readiness

| Probe         | Purpose                        | Endpoint        |
| ------------- | ------------------------------ | --------------- |
| **Liveness**  | Is the process running?        | `/health/live`  |
| **Readiness** | Can the process serve traffic? | `/health/ready` |

---

## 6. Alerting

### 6.1 Alert Rules

| Metric               | Condition      | Severity | Action    |
| -------------------- | -------------- | -------- | --------- |
| Error rate           | > 5% for 5 min | Critical | PagerDuty |
| Response time        | > 2s for 5 min | Warning  | Slack     |
| Database connections | > 80% pool     | Warning  | Slack     |
| Queue length         | > 1000 pending | Warning  | Slack     |
| Disk usage           | > 85%          | Critical | PagerDuty |

### 6.2 Alert Channels

```yaml
# alerting.yaml
alerts:
  - name: high-error-rate
    condition: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    severity: critical
    channels:
      - pagerduty
      - slack

  - name: slow-responses
    condition: histogram_quantile(0.95, http_request_duration_seconds) > 2
    severity: warning
    channels:
      - slack
```

---

## 7. Dashboards

### 7.1 Grafana Dashboard Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GRAFANA DASHBOARD                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐     │
│  │  Request Rate      │ │  Error Rate        │ │  Response Time    │     │
│  │  (requests/sec)    │ │  (errors/sec)      │ │  (p95, p99)       │     │
│  │  [Time Graph]      │ │  [Time Graph]       │ │  [Time Graph]     │     │
│  └────────────────────┘ └────────────────────┘ └────────────────────┘     │
│                                                                             │
│  ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐     │
│  │  Active Users      │ │  API Calls by      │ │  Database         │     │
│  │  (gauge)           │ │  Endpoint          │ │  Connections      │     │
│  │  [Number]          │ │  [Bar Chart]       │ │  [Number]         │     │
│  └────────────────────┘ └────────────────────┘ └────────────────────┘     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Recent Errors                                                      │   │
│  │  [Table: timestamp, service, error, count]                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Log Aggregation

### 8.1 Stack

| Component        | Purpose                     |
| ---------------- | --------------------------- |
| **Pino**         | JSON logging in application |
| **Loki**         | Log aggregation             |
| **Grafana**      | Log visualization           |
| **AlertManager** | Alert routing               |

### 8.2 Loki Configuration

```yaml
# loki-config.yaml
auth_enabled: false

server:
  http_listen_port: 3100

schema_config:
  configs:
    - from: 2020-05-15
      store: boltdb
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb:
    directory: /tmp/loki/index
  filesystem:
    directory: /tmp/loki/chunks

limits_config:
  reject_old_samples: true
  reject_old_samples_max_age: 168h
```

---

## 9. Best Practices

### 9.1 Logging Best Practices

1. **Always include correlation IDs** - Link logs across services
2. **Use structured JSON** - Enables easy querying
3. **Log appropriate levels** - Don't log everything at info
4. **Include context** - User ID, workspace ID, request ID
5. **Sanitize sensitive data** - Never log passwords, tokens

### 9.2 Metrics Best Practices

1. **Use histograms for durations** - Better than averages
2. **Add relevant labels** - For filtering and grouping
3. **Set appropriate buckets** - Match your SLA thresholds
4. **Monitor queue depth** - Early warning for backlogs

### 9.3 Tracing Best Practices

1. **Propagate trace context** - Across service boundaries
2. **Instrument all operations** - Database, cache, external APIs
3. **Use meaningful span names** - `db.query`, `http.get`
4. **Add relevant attributes** - User ID, operation details
