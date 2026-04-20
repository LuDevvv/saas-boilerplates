import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JWT_CONSTANTS } from './constants';
import { JwtStrategy, LocalStrategy, GoogleStrategy, GitHubStrategy } from './strategies';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { TwoFactorService } from './two-factor/two-factor.service';
import { CacheService } from '@node-stack/cache';
import { SessionRepository } from '@node-stack/db';

import { DatabaseModule } from '../common/database/database.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';

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
