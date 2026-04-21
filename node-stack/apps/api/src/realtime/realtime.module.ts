import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@node-stack/cache';

import { RealtimeGateway } from './realtime.gateway.js';
import { RealtimeService } from './realtime.service.js';
import { EventBridgeService } from './event-bridge.service.js';
import { WsJwtGuard } from './ws-jwt.guard.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWT_CONSTANTS } from '../auth/constants.js';
import { WorkspacesModule } from '../workspaces/workspaces.module.js';

@Module({
  imports: [
    CacheModule,
    EventEmitterModule.forRoot(),
    WorkspacesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || JWT_CONSTANTS.ACCESS_SECRET,
      }),
    }),
  ],
  providers: [RealtimeGateway, RealtimeService, WsJwtGuard, EventBridgeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
