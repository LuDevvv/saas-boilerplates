/**
 * Safe Tracing initialization with dynamic imports to avoid ESM resolution crashes
 * during build steps or OpenAPI export.
 */
export async function initTracing() {
  if (process.env.SKIP_TRACING === 'true' || process.env.NODE_ENV === 'test') {
    console.log('⏩ Tracing skipped (SKIP_TRACING=true or NODE_ENV=test)');
    return;
  }

  try {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
    const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node');
    const { BullMQInstrumentation } = await import('opentelemetry-instrumentation-bullmq');
    const Sentry = await import('@sentry/node');
    const { SentrySpanProcessor, SentryPropagator } = await import('@sentry/opentelemetry');

    // Initialize Sentry
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.APP_VERSION,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
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
        new SentrySpanProcessor() as any,
      ],
      textMapPropagator: new SentryPropagator() as any,
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': { enabled: false },
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
    
    console.log('✅ Tracing and Sentry initialized');
  } catch (err) {
    console.warn('⚠️ Failed to initialize tracing:', err.message);
    // Do not crash the process in dev/export
    if (process.env.NODE_ENV === 'production') {
      throw err;
    }
  }
}

// Initial call if not imported as a module
if (import.meta.url === `file:///${process.argv[1]}`.replace(/\\/g, '/')) {
  initTracing();
}
