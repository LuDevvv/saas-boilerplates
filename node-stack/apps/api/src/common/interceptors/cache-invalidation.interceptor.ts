import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CacheService } from "@node-stack/cache";
import { Observable, tap } from "rxjs";

import { CACHE_INVALIDATE_KEY } from "@/common/decorators/cache-invalidate.decorator.js";

interface CacheRequest {
  params?: { workspaceId?: string; id?: string };
  body?: { workspaceId?: string };
  workspace?: { id?: string };
}

@Injectable()
export class CacheInvalidationInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private cacheService: CacheService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const patterns = this.reflector.get<string[]>(
      CACHE_INVALIDATE_KEY,
      context.getHandler(),
    );

    if (!patterns) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<CacheRequest>();
    const workspaceId =
      req.params?.["workspaceId"] ??
      req.params?.["id"] ??
      req.body?.workspaceId ??
      req.workspace?.id;

    return next.handle().pipe(
      tap(async () => {
        if (workspaceId) {
          for (const pattern of patterns) {
            await this.cacheService.invalidateAndBroadcast(
              pattern.replace("{workspaceId}", workspaceId),
              workspaceId,
            );
          }
        }
      }),
    );
  }
}
