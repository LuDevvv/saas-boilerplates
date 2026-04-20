import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { AuthRepository } from './repositories/auth.repository';
import { InvitationRepository } from './repositories/invitation.repository';
import { ApiKeyRepository } from './repositories/api-key.repository';
import { UserRepository } from './repositories/user.repository';
import { WorkspaceRepository } from './repositories/workspace.repository';
import { SessionRepository } from './repositories/session.repository';
import { AiRepository } from './repositories/ai.repository';
import { BillingRepository } from './repositories/billing.repository';
import { InboundWebhookRepository } from './repositories/inbound-webhook.repository';
import { AnalyticsRepository } from './repositories/analytics.repository';
import { FileRepository } from './repositories/file.repository';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { SystemConfigRepository } from './repositories/system-config.repository';
import { PortabilityRepository } from './repositories/portability.repository';
import * as schema from './schema';
import { DB_TOKEN } from './tokens';

@Global()
@Module({
  providers: [
    {
      provide: DB_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const conn = config.getOrThrow('DATABASE_URL');
        const pool = new Pool({ connectionString: conn });
        return drizzle(pool, {
          schema,
          logger: config.get('NODE_ENV') === 'development',
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
