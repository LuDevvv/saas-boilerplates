import 'reflect-metadata';
import './tracing';
import { Logger, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { nestIntegration } from '@sentry/nestjs';
import * as Sentry from '@sentry/node';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import { cleanupOpenApiDoc, createZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ApiVersionMiddleware } from './common/middleware/api-version.middleware';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { RedisIoAdapter } from './realtime/redis-io.adapter';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION,
  integrations: [nestIntegration()],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: 0.1,
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // WebSocket Redis adapter for horizontal scaling
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis(configService);
  app.useWebSocketAdapter(redisIoAdapter);

  // Security headers (must be first)
  app.use(helmet());

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

  // Register request-id middleware early (before body parsers)
  app.use(new RequestIdMiddleware().use);
  // Register API version middleware
  app.use(new ApiVersionMiddleware().use);
  // Register structured logging middleware (production-ready JSON logs in production, pretty in development)
  app.use((req: any, res: any, next: any) => new LoggingMiddleware().use(req, res, next));
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
  const config = new DocumentBuilder()
    .setTitle('Node Stack API')
    .setDescription(
      'Production-ready Node.js SaaS Backend with NestJS, PostgreSQL, Redis, and BullMQ.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-KEY',
        in: 'header',
        description: 'Enter your workspace API key',
      },
      'ApiKeyAuth',
    )
    .addTag('auth', 'Authentication and session management')
    .addTag('workspaces', 'Workspace and team member management')
    .addTag('api-keys', 'Programmable API key management')
    .addTag('ai', 'AI generation and task processing')
    .addTag('webhooks', 'Inbound and outbound webhook configuration')
    .addTag('billing', 'Subscription and billing management')
    .addTag('users', 'User profile management')
    .addTag('storage', 'File storage and presigned URLs')
    .addTag('health', 'Service health and readiness')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, cleanupOpenApiDoc(document));

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
      const mod = await import('@node-stack/db');
      if (typeof mod.endPool === 'function') await mod.endPool();
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

bootstrap();
