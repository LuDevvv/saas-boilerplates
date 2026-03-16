import type { Context } from "hono";

/**
 * Extracts a unique identifier mapping to the request lifecycle.
 * Utilizes Cloudflare's native cf-ray header tracing.
 */
const extractRequestId = (c?: Context): string => {
  if (!c) return "system-background";
  try {
    return c.req.header("cf-ray") || "unknown-ray-id";
  } catch {
    return "unknown";
  }
};

/**
 * Structured JSON Logger for integration with external analysis
 * tools (like Axiom, Datadog or Sentry).
 */
class StructuredLogger {
  private buildPayload(
    level: string,
    c: Context | undefined,
    message: string,
    meta?: Record<string, unknown>,
  ) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      requestId: extractRequestId(c),
      message,
      ...meta,
    });
  }

  /**
   * Log informational events sequentially inside execution flows.
   */
  info(
    c: Context | undefined,
    message: string,
    meta?: Record<string, unknown>,
  ) {
    console.info(this.buildPayload("INFO", c, message, meta));
  }

  /**
   * Log warnings representing non-fatal degrading events.
   */
  warn(
    c: Context | undefined,
    message: string,
    meta?: Record<string, unknown>,
  ) {
    console.warn(this.buildPayload("WARN", c, message, meta));
  }

  /**
   * Log errors directly mapped against exception outputs.
   */
  error(
    c: Context | undefined,
    message: string,
    error?: unknown,
    meta?: Record<string, unknown>,
  ) {
    let errorDetails = {};

    if (error instanceof Error) {
      errorDetails = {
        errorName: error.name,
        errorMessage: error.message,
        stackTrace: error.stack,
      };
    } else if (error) {
      errorDetails = { rawError: error };
    }

    console.error(
      this.buildPayload("ERROR", c, message, { ...meta, ...errorDetails }),
    );
  }
}

export const logger = new StructuredLogger();
