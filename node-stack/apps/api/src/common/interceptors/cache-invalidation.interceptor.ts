import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CacheService } from "@node-stack/cache";
import { tap } from "rxjs";

import { CACHE_INVALIDATE_KEY } from "../decorators/cache-invalidate.decorator.js";

@Injectable()
export class CacheInvalidationInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private cacheService: CacheService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const patterns = this.reflector.get<string[]>(
      CACHE_INVALIDATE_KEY,
      context.getHandler(),
    );

    if (!patterns) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest();
    const workspaceId =
      req.params?.workspaceId ||
      req.params?.id ||
      req.body?.workspaceId ||
      req.workspace?.id;

    return next.handle().pipe(
      tap(async () => {
        if (workspaceId) {
          for (const pattern of patterns) {
            await this.cacheService.invalidate(
              pattern.replace("{workspaceId}", workspaceId),
              workspaceId,
            );
          }
        }
      }),
    );
  }
}
