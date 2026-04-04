import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { WorkerModule } from "./worker.module";

// Note: Environment variables are loaded via `node -r dotenv/config` in package.json

async function bootstrap() {
  const logger = new Logger("Worker");

  // Create app
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ["log", "error", "warn", "debug"],
  });

  // Enable NestJS lifecycle hooks (OnModuleDestroy, OnApplicationShutdown, etc.)
  // so that processors can clean up their BullMQ workers gracefully.
  app.enableShutdownHooks();

  logger.log("Worker started successfully");
  logger.log("Outbox processor is running...");
  logger.log("Waiting for events to process...");

  // Graceful shutdown handler — works with Docker SIGTERM and local Ctrl+C (SIGINT).
  // We do NOT call process.exit() — we let NestJS lifecycle finish naturally
  // after app.close() triggers OnModuleDestroy on all processors.
  const shutdown = async (signal: string) => {
    logger.log(`[Worker] ${signal} received. Starting graceful shutdown...`);

    try {
      logger.log("[Worker] Closing NestJS application context...");
      await app.close();
      logger.log(
        "[Worker] Shutdown complete. All jobs finished. Goodbye! 🛑",
      );
    } catch (error) {
      logger.error(
        `[Worker] Error during shutdown: ${error instanceof Error ? error.message : String(error)}`,
      );
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((error) => {
  console.error("Failed to start worker:", error);
  process.exit(1);
});
