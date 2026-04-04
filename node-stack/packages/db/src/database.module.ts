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
  ],
  exports: [
    DB_TOKEN,
    WorkspaceRepository,
    UserRepository,
    InvitationRepository,
    SessionRepository,
    ApiKeyRepository,
    AuthRepository,
  ],
})
export class DatabaseModule {}
