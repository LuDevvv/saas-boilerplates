# Observability Documentation

The Node Stack implements a "Three Pillars of Observability" strategy (Logs, Metrics, and Traces) using industry-standard tools.

---

## 1. Structured Logging (Pino)

We use **Pino** for high-performance, structured JSON logging. In development, logs are pretty-printed for better readability.

### 1.1 Trace Correlation
Every log entry automatically includes:
- `trace_id`: Links the log to a specific OpenTelemetry trace.
- `span_id`: Links the log to a specific operation within a trace.

This allows you to find an error in Jaeger and immediately see all corresponding logs in your log aggregator (e.g., Loki or Datadog).

---

## 2. Real-time Metrics (Prometheus)

The `MetricsModule` exports a `/v1/metrics` endpoint in Prometheus format.

### 2.1 Tracked Metrics
- **HTTP**: Request counts and duration histograms (bucketed for p95/p99 analysis).
- **Database**: Active connection pool stats.
- **Queues**: Job success/failure rates and outbox processing speed.
- **Runtime**: Default Node.js metrics (memory, GC, event loop lag).

---

## 3. Distributed Tracing (OpenTelemetry)

Distributed tracing is enabled via `@opentelemetry/sdk-node`. It automatically instruments:
- **HTTP/Express**: Every incoming and outgoing request.
- **PostgreSQL**: Every SQL query executed via Drizzle.
- **Redis**: Every command sent to the cache or queue.

### 3.1 Jaeger UI
In the development environment, you can visualize traces at:
`http://localhost:16686`

This is essential for identifying bottlenecks in complex "Unit of Work" transactions or background job chains.

---

## 4. Health Checks

The `HealthModule` provides deep health monitoring:
- **Liveness**: (`/v1/health/live`) Returns `200` if the process is up.
- **Readiness**: (`/v1/health/ready`) Checks if Database, Redis, and Storage are actually responsive.

---

## 5. Error Tracking (Sentry)

Sentry is integrated as an `ExceptionFilter` and `Interceptor`. It captures:
- Unhandled exceptions.
- `UnprocessableEntityException` (Validation errors).
- Metadata about the user and workspace associated with the error.
