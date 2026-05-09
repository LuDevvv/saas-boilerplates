/**
 * Safe Tracing initialization with dynamic imports to avoid ESM resolution crashes
 * during build steps or OpenAPI export.
 */
export async function initTracing(): Promise<void> {
  if (process.env.SKIP_TRACING === 'true' || process.env.NODE_ENV === 'test') {
    console.warn('Tracing skipped (SKIP_TRACING=true or NODE_ENV=test)');
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
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318/v1/traces',
    });

    // SentrySpanProcessor and SentryPropagator do not implement the exact
    // OpenTelemetry interfaces expected by NodeSDK due to the Sentry/OTel bridge.
    // We use `as unknown as` to satisfy the type system without suppressing
    // entire files.
    type OtelSpanProcessor = ConstructorParameters<typeof NodeSDK>[0] extends { spanProcessors?: infer A } ? NonNullable<A> extends Array<infer E> ? E : never : never;
    type OtelPropagator = ConstructorParameters<typeof NodeSDK>[0] extends { textMapPropagator?: infer P } ? NonNullable<P> : never;

    const sdk = new NodeSDK({
      traceExporter,
      spanProcessors: [new SentrySpanProcessor() as unknown as OtelSpanProcessor],
      textMapPropagator: new SentryPropagator() as unknown as OtelPropagator,
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
        .then(() => { console.warn('Tracing terminated'); })
        .catch((error: unknown) => { console.error('Error terminating tracing', error); });
    });

    console.warn('Tracing and Sentry initialized');
  } catch (err: unknown) {
    console.warn('Failed to initialize tracing:', (err as Error).message);
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
