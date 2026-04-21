import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { Redis } from "ioredis";

import { AdminModule } from './admin/admin.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './auth/guards/jwt.guard.js';
import { BillingModule } from './billing/billing.module.js';
import { AuditInterceptor } from './common/interceptors/audit.interceptor.js';
import { MetricsModule } from './metrics/metrics.module.js';
import { MetricsInterceptor } from './metrics/metrics.interceptor.js';
import { MetricsService } from './metrics/metrics.service.js';
import { StorageModule } from './storage/storage.module.js';
import { WorkspacesModule } from './workspaces/workspaces.module.js';
import { ApiKeysModule } from './api-keys/api-keys.module.js';
import { HealthModule } from './health/health.module.js';
import { AiModule } from './ai/ai.module.js';
import { FeatureFlagGuard } from './common/guards/feature-flag.guard.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { PortabilityModule } from './portability/portability.module.js';

import { AdminGuard } from './common/guards/admin.guard.js';
import { CacheInvalidationInterceptor } from './common/interceptors/cache-invalidation.interceptor.js';
import { WorkspaceGuard } from './common/guards/workspace.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { PermissionsGuard } from './common/guards/permissions.guard.js';
import { CustomThrottlerGuard } from './common/guards/throttler.guard.js';

import { CommonModule } from './common/common.module.js';
import { DatabaseModule } from '@node-stack/db';
import { RealtimeModule } from './realtime/realtime.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { CacheModule } from '@node-stack/cache';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebhooksModule } from './webhooks/webhooks.module.js';

@Module({
  imports: [
    CacheModule,
    CommonModule,
    DatabaseModule,
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    WorkspacesModule,
    ApiKeysModule,
    BillingModule,
    StorageModule,
    HealthModule,
    AiModule,
    MetricsModule,
    RealtimeModule,
    NotificationsModule,
    WebhooksModule,
    AnalyticsModule,
    PortabilityModule,
    AdminModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          { name: 'short', ttl: 1000, limit: 10 },
          { name: 'medium', ttl: 60000, limit: 100 },
          { name: 'long', ttl: 3600000, limit: 1000 },
        ],
        storage: new ThrottlerStorageRedisService(new Redis(config.get('REDIS_URL') as string)),
        errorMessage: 'Too many requests. Please retry after {ttl} seconds.',
        skipIf: (ctx) => ctx.switchToHttp().getRequest().ip === '127.0.0.1',
      }),
    }),
  ],
  controllers: [],
  providers: [
    MetricsService,
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
    { provide: APP_INTERCEPTOR, useClass: CacheInvalidationInterceptor },
    FeatureFlagGuard,
    AdminGuard,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
    { provide: APP_GUARD, useClass: WorkspaceGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule { }
