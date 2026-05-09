import type { TextMapPropagator } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK } from '@opentelemetry/sdk-node';
import type { SpanProcessor } from '@opentelemetry/sdk-trace-base';
import * as Sentry from '@sentry/node';
import { SentryPropagator, SentrySpanProcessor } from '@sentry/opentelemetry';
import { BullMQInstrumentation } from 'opentelemetry-instrumentation-bullmq';

// Initialize Sentry with 'otel' instrumenter so it doesn't try to patch things itself
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // instrumenter: 'otel', // Removed in @sentry/node v9
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
});

// SentrySpanProcessor and SentryPropagator implement the OTel interfaces but ship
// their own interface versions; NodeSDK's type definitions include `any` internally,
// so we cast through unknown to satisfy the strict types.
const sentrySpanProcessor = new SentrySpanProcessor() as unknown as SpanProcessor;
const sentryPropagator = new SentryPropagator() as unknown as TextMapPropagator;

const sdk = new NodeSDK({
  traceExporter,
  spanProcessors: [sentrySpanProcessor],
  textMapPropagator: sentryPropagator,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false }, // Reduce noise
    }),
    new BullMQInstrumentation(),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.warn('Tracing terminated'))
    .catch((error) => console.error('Error terminating tracing', error));
});
