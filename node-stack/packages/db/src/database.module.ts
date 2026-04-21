import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { AuthRepository } from './repositories/auth.repository.js';
import { InvitationRepository } from './repositories/invitation.repository.js';
import { ApiKeyRepository } from './repositories/api-key.repository.js';
import { UserRepository } from './repositories/user.repository.js';
import { WorkspaceRepository } from './repositories/workspace.repository.js';
import { SessionRepository } from './repositories/session.repository.js';
import { AiRepository } from './repositories/ai.repository.js';
import { BillingRepository } from './repositories/billing.repository.js';
import { InboundWebhookRepository } from './repositories/inbound-webhook.repository.js';
import { AnalyticsRepository } from './repositories/analytics.repository.js';
import { FileRepository } from './repositories/file.repository.js';
import { AuditLogRepository } from './repositories/audit-log.repository.js';
import { SystemConfigRepository } from './repositories/system-config.repository.js';
import { PortabilityRepository } from './repositories/portability.repository.js';
import * as schema from './schema/index.js';
import { DB_TOKEN } from './tokens.js';

@Global()
@Module({
  providers: [
    {
      provide: DB_TOKEN,
      useFactory: () => {
        const conn = process.env.DATABASE_URL;
        if (!conn) {
          throw new Error('DATABASE_URL environment variable is not set');
        }
        const pool = new Pool({ connectionString: conn });
        return drizzle(pool, {
          schema,
          logger: process.env.NODE_ENV === 'development',
        });
      },
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
  ],
  exports: [
    DB_TOKEN,
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
  ],
})
export class DatabaseModule {}
