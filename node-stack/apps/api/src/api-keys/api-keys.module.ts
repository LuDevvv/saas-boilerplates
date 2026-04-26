import { Module } from '@nestjs/common';
import { DatabaseModule } from "@node-stack/db";

import { ApiKeysController } from '@/api-keys/api-keys.controller.js';
import { ApiKeysService } from '@/api-keys/api-keys.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysService],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
