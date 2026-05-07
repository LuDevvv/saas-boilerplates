import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CacheService } from '@node-stack/cache';
import { SessionRepository , DatabaseModule } from '@node-stack/db';

import { ApiKeysModule } from '@/api-keys/api-keys.module.js';
import { AuthController } from '@/auth/auth.controller.js';
import { AuthService } from '@/auth/auth.service.js';
import { JWT_EXPIRY } from '@/auth/constants.js';
import { ApiKeyStrategy } from '@/auth/strategies/api-key.strategy.js';
import { JwtStrategy, LocalStrategy, GoogleStrategy, GitHubStrategy } from '@/auth/strategies/index.js';
import { TwoFactorService } from '@/auth/two-factor/two-factor.service.js';



@Module({
  imports: [
    DatabaseModule,
    ApiKeysModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: JWT_EXPIRY.ACCESS,
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
