import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

export function logWithContext(
  level: "info" | "warn" | "error",
  message: string,
  context?: Record<string, unknown>,
) {
  // Delegate to internal logger with context as metadata
  if (context) {
    (logger as any)[level](context, message);
  } else {
    logger[level](message);
  }
}
