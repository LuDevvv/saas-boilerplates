import { Module, Global } from "@nestjs/common";
import { 
  db, 
  DB_TOKEN, 
  WorkspaceRepository, 
  UserRepository, 
  InvitationRepository, 
  SessionRepository,
  AuthRepository,
  ApiKeyRepository,
} from "@node-stack/db";

@Global()
@Module({
  providers: [
    {
      provide: DB_TOKEN,
      useValue: db,
    },
    WorkspaceRepository,
    UserRepository,
    InvitationRepository,
    SessionRepository,
    AuthRepository,
    ApiKeyRepository,
  ],
  exports: [
    DB_TOKEN,
    WorkspaceRepository,
    UserRepository,
    InvitationRepository,
    SessionRepository,
    AuthRepository,
    ApiKeyRepository,
  ],
})
export class DatabaseModule {}
