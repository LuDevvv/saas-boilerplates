import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { RequestContextService } from './context/request-context.service.js';
import { AiRepository } from './repositories/ai.repository.js';
import { AnalyticsRepository } from './repositories/analytics.repository.js';
import { ApiKeyRepository } from './repositories/api-key.repository.js';
import { AuditLogRepository } from './repositories/audit-log.repository.js';
import { AuthRepository } from './repositories/auth.repository.js';
import { BillingRepository } from './repositories/billing.repository.js';
import { FileRepository } from './repositories/file.repository.js';
import { InboundWebhookRepository } from './repositories/inbound-webhook.repository.js';
import { InvitationRepository } from './repositories/invitation.repository.js';
import { PortabilityRepository } from './repositories/portability.repository.js';
import { SessionRepository } from './repositories/session.repository.js';
import { SystemConfigRepository } from './repositories/system-config.repository.js';
import { UserRepository } from './repositories/user.repository.js';
import { WorkspaceRepository } from './repositories/workspace.repository.js';
import * as schema from './schema/index.js';
import { DB_TOKEN, POOL_TOKEN, READ_DB_TOKEN } from './tokens.js';

@Global()
@Module({
  providers: [
    {
      provide: POOL_TOKEN,
      useFactory: () => {
        const conn = process.env.DATABASE_URL;
        if (!conn) {
          throw new Error('DATABASE_URL environment variable is not set');
        }
        return new Pool({ 
          connectionString: conn,
          max: parseInt(process.env.DB_POOL_MAX || '10', 10),
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        });
      },
    },
    {
      provide: DB_TOKEN,
      useFactory: (pool: Pool) => {
        return drizzle(pool, {
          schema,
          logger: process.env.NODE_ENV === 'development',
        });
      },
      inject: [POOL_TOKEN],
    },
    {
      // READ_DB_TOKEN points to a read replica when READ_REPLICA_URL is set,
      // otherwise falls back to the primary so code using it needs no branching.
      provide: READ_DB_TOKEN,
      useFactory: (primaryPool: Pool) => {
        const replicaUrl = process.env.READ_REPLICA_URL;
        const pool = replicaUrl
          ? new Pool({
              connectionString: replicaUrl,
              max: parseInt(process.env.DB_REPLICA_POOL_MAX ?? '5', 10),
              idleTimeoutMillis: 30000,
              connectionTimeoutMillis: 2000,
            })
          : primaryPool;
        return drizzle(pool, { schema });
      },
      inject: [POOL_TOKEN],
    },
    WorkspaceRepository,
    UserRepository,
    InvitationRepository,
    SessionRepository,
    ApiKeyRepository,
    AuthRepository,
    AiRepository,
    BillingRepository,
    InboundWebhookRepository,
    AnalyticsRepository,
    FileRepository,
    AuditLogRepository,
    SystemConfigRepository,
    PortabilityRepository,
    RequestContextService,
  ],
  exports: [
    DB_TOKEN,
    READ_DB_TOKEN,
    POOL_TOKEN,
    WorkspaceRepository,
    UserRepository,
    InvitationRepository,
    SessionRepository,
    ApiKeyRepository,
    AuthRepository,
    AiRepository,
    BillingRepository,
    InboundWebhookRepository,
    AnalyticsRepository,
    FileRepository,
    AuditLogRepository,
    SystemConfigRepository,
    PortabilityRepository,
    RequestContextService,
  ],
})
export class DatabaseModule {}
