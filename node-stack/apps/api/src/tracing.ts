import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { BullMQInstrumentation } from 'opentelemetry-instrumentation-bullmq';
import * as Sentry from '@sentry/node';
import { SentrySpanProcessor, SentryPropagator } from '@sentry/opentelemetry';

// Initialize Sentry with 'otel' instrumenter so it doesn't try to patch things itself
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // instrumenter: 'otel',
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

const sdk = new NodeSDK({
  traceExporter,
  spanProcessors: [
    // Add Sentry Span Processor to route traces to Sentry
    new SentrySpanProcessor() as any,
  ],
  textMapPropagator: new SentryPropagator() as any,
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
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error));
});
