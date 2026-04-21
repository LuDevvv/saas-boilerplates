import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JWT_CONSTANTS } from './constants.js';
import { JwtStrategy, LocalStrategy, GoogleStrategy, GitHubStrategy } from './strategies/index.js';
import { ApiKeyStrategy } from './strategies/api-key.strategy.js';
import { TwoFactorService } from './two-factor/two-factor.service.js';
import { CacheService } from '@node-stack/cache';
import { SessionRepository } from '@node-stack/db';

import { DatabaseModule } from "@node-stack/db";
import { ApiKeysModule } from '../api-keys/api-keys.module.js';

@Module({
  imports: [
    DatabaseModule,
    ApiKeysModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || JWT_CONSTANTS.ACCESS_SECRET,
        signOptions: {
          expiresIn: JWT_CONSTANTS.ACCESS_EXPIRY,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TwoFactorService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    GitHubStrategy,
    ApiKeyStrategy,
  ],

  exports: [AuthService],
})
export class AuthModule {}
