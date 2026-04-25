import 'reflect-metadata';
import { initTracing } from './tracing.js';
import { validateEnv } from '@node-stack/config';

// Validate environment variables before anything else
validateEnv(process.env);

import { Logger as NestLogger, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import { cleanupOpenApiDoc, createZodValidationPipe } from 'nestjs-zod';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';

import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { ApiVersionMiddleware } from './common/middleware/api-version.middleware.js';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware.js';
import { setupSwagger } from './common/docs/swagger.config.js';
import { RedisIoAdapter } from './realtime/redis-io.adapter.js';

// Global error handlers — MUST be before bootstrap() to catch silent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('[FATAL] Uncaught Exception:', error);
  process.exit(1);
});

async function bootstrap() {
  await initTracing();
  const logger = new NestLogger('Bootstrap');

  logger.log('Creating NestJS application...');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    abortOnError: true,
  });
  app.useLogger(app.get(Logger));
  
  // Enable NestJS shutdown hooks (OnModuleDestroy, etc.)
  app.enableShutdownHooks();
  
  logger.log('NestJS application created successfully.');
  const configService = app.get(ConfigService);

  // WebSocket Redis adapter for horizontal scaling
  if (process.env.GENERATE_OPENAPI !== 'true') {
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis(configService);
    app.useWebSocketAdapter(redisIoAdapter);
  }

  // Security headers with strict CSP (must be first)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
  }));

  // Defensive cookie configuration: force secure defaults on all res.cookie calls
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const originalCookie = res.cookie;
    res.cookie = function (this: express.Response, name: string, value: any, options?: express.CookieOptions) {
      const secureOptions: express.CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        ...(options || {}),
      };
      return (originalCookie as any).call(this, name, value, secureOptions);
    } as any;
    next();
  });

  // Set global API prefix (v1) with exclusions
  app.setGlobalPrefix('v1', {
    exclude: [
      '/api/docs',
      '/api/docs-json',
      '/billing/webhook',
      '/health',
      '/health/live',
      '/health/ready',
    ],
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new (createZodValidationPipe({
      createValidationException: (error: any) => {
        const errors = Array.isArray(error.errors)
          ? error.errors.map((e: any) => ({
              path: e.path,
              message: e.message,
            }))
          : [];

        return new UnprocessableEntityException({
          statusCode: 422,
          message: 'Validation failed',
          errors,
        });
      },
    }))(),
  );
  // Webhook raw body middleware must run before JSON body parsing
  app.use('/billing/webhook', express.raw({ type: 'application/json' }));

  // Global JSON body parser (excluding webhook path which uses raw body)

  // Swagger configuration
  setupSwagger(app);

  const port = process.env.PORT || 4000;

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'Idempotency-Key'],
    exposedHeaders: [
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    maxAge: 86400,
  });

  // Enable JSON parsing for all routes except webhook (which uses raw body)
  app.use(express.json());
  // Compress responses > 1KB
  app.use(compression({ threshold: 1024 }));
  await app.listen(port);

  // Graceful shutdown handlers
  const SHUTDOWN_TIMEOUT_MS = 10000;
  let shuttingDown = false;
  let shutdownTimer: any;

  const upgradeShutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.log(`${signal} received. Starting graceful shutdown...`);

    shutdownTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    try {
      await app.close();
    } catch {
      // ignore errors during close
    }
    try {
      const mod = await import('@node-stack/db') as Record<string, unknown>;
      if (typeof mod.endPool === 'function') await (mod.endPool as () => Promise<void>)();
    } catch {
      // ignore
    }
    if (shutdownTimer) clearTimeout(shutdownTimer);
    logger.log('Graceful shutdown completed.');
    process.exit(0);
  };

  process.on('SIGTERM', () => upgradeShutdown('SIGTERM'));
  process.on('SIGINT', () => upgradeShutdown('SIGINT'));

  logger.log(`API is running on: http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start API:', err);
  process.exit(1);
});
