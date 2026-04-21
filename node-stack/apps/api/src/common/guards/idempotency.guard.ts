import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { IdempotencyService } from "../services/idempotency.service.js";

export const IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";

@Injectable()
export class IdempotencyGuard implements CanActivate {
  private readonly logger = new Logger(IdempotencyGuard.name);

  constructor(private readonly idempotency: IdempotencyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const idempotencyKey: string | undefined =
      req.headers?.[IDEMPOTENCY_KEY_HEADER.toLowerCase()];

    if (!idempotencyKey) {
      return true;
    }

    const cached = await this.idempotency.get(idempotencyKey);

    if (cached) {
      req.idempotencyCachedResponse = cached;
      return true;
    }

    const lockAcquired = await this.idempotency.setWithLock(idempotencyKey);

    if (!lockAcquired) {
      this.logger.warn(
        `Lock contention for idempotency key: ${idempotencyKey}`,
      );
      throw new ConflictException(
        "A request with this Idempotency-Key is already being processed",
      );
    }

    req.idempotencyKey = idempotencyKey;
    return true;
  }
}
