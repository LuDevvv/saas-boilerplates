import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@node-stack/cache';

import { JWT_CONSTANTS } from '@/auth/constants.js';
import { EventBridgeService } from '@/realtime/event-bridge.service.js';
import { RealtimeGateway } from '@/realtime/realtime.gateway.js';
import { RealtimeService } from '@/realtime/realtime.service.js';
import { WsJwtGuard } from '@/realtime/ws-jwt.guard.js';
import { WorkspacesModule } from '@/workspaces/workspaces.module.js';

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
