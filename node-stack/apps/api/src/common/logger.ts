import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

type LogLevel = "info" | "warn" | "error";

export function logWithContext(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
): void {
  // Delegate to internal logger with context as metadata
  if (context) {
    logger[level](context, message);
  } else {
    logger[level](message);
  }
}
