import "./tracing.js";

import { Logger as NestLogger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { validateEnv } from "@node-stack/config";
import { Logger } from "nestjs-pino";

import { WorkerModule } from "./worker.module.js";

// Validate environment variables before anything else
validateEnv(process.env);

async function bootstrap(): Promise<void> {
  const logger = new NestLogger("Worker");

  // Create app
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  // Enable NestJS lifecycle hooks (OnModuleDestroy, OnApplicationShutdown, etc.)
  // so that processors can clean up their BullMQ workers gracefully.
  app.enableShutdownHooks();

  logger.log("Worker started successfully");
  logger.log("Outbox processor is running...");
  logger.log("Waiting for events to process...");

  // Graceful shutdown handler — works with Docker SIGTERM and local Ctrl+C (SIGINT).
  let shuttingDown = false;
  const GRACE_PERIOD_MS = 30000; // 30 seconds for BullMQ jobs

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.log(`[Worker] ${signal} received. Starting graceful shutdown...`);

    const forceExitTimer = setTimeout(() => {
      logger.error(`[Worker] Graceful shutdown timed out after ${GRACE_PERIOD_MS}ms. Forcing exit.`);
      process.exit(1);
    }, GRACE_PERIOD_MS + 5000); // Give a bit of extra time for app.close() itself

    try {
      logger.log("[Worker] Closing NestJS application context (this waits for workers to drain)...");
      await app.close();

      try {
        const mod = await import('@node-stack/db') as Record<string, unknown>;
        if (typeof mod.endPool === 'function') await (mod.endPool as () => Promise<void>)();
      } catch {
        // ignore
      }

      clearTimeout(forceExitTimer);
      logger.log(
        "[Worker] Shutdown complete. All jobs finished. Goodbye! 🛑",
      );
      process.exit(0);
    } catch (error) {
      logger.error(
        `[Worker] Error during shutdown: ${error instanceof Error ? error.message : String(error)}`,
      );
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => { void shutdown("SIGTERM"); });
  process.on("SIGINT", () => { void shutdown("SIGINT"); });
}

bootstrap().catch((error) => {
  console.error("Failed to start worker:", error);
  process.exit(1);
});
