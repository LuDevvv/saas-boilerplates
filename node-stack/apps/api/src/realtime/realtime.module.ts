import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@node-stack/cache';

import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { EventBridgeService } from './event-bridge.service';
import { WsJwtGuard } from './ws-jwt.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWT_CONSTANTS } from '../auth/constants';
import { WorkspacesModule } from '../workspaces/workspaces.module';

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
