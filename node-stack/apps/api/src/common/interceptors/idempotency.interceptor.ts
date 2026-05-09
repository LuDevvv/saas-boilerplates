import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  ConflictException,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { Observable, of, throwError, from } from "rxjs";
import { tap, catchError, switchMap } from "rxjs/operators";

import { IdempotencyService } from "@/common/services/idempotency.service.js";

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);
  private readonly IDEMPOTENCY_HEADER = "idempotency-key";

  constructor(private readonly idempotency: IdempotencyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const idempotencyKey = req.headers[this.IDEMPOTENCY_HEADER] as string;

    // Only apply if the header is present and it's a mutating request
    if (!idempotencyKey || !["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      return next.handle();
    }

    this.logger.debug(`Processing request with idempotency key: ${idempotencyKey}`);

    return from(this.idempotency.get(idempotencyKey)).pipe(
      switchMap((cached) => {
        if (cached) {
          this.logger.log(`Idempotency cache hit for key: ${idempotencyKey}`);
          res.status(cached.statusCode);
          res.setHeader("X-Idempotency-Hit", "true");
          return of(cached.data as unknown);
        }

        return from(this.idempotency.setWithLock(idempotencyKey)).pipe(
          switchMap((locked) => {
            if (!locked) {
              this.logger.warn(`Idempotency lock contention for key: ${idempotencyKey}`);
              throw new ConflictException(
                "A request with this idempotency key is already in progress",
              );
            }

            return next.handle().pipe(
              tap(async (data) => {
                const statusCode = res.statusCode;
                // Only cache successful responses (2xx) or specific ones?
                // Usually we cache all except server errors (5xx)
                if (statusCode < 500) {
                  await this.idempotency.set(idempotencyKey, { statusCode, data });
                }
                await this.idempotency.releaseLock(idempotencyKey);
              }),
              catchError((err: unknown) => {
                // Release lock on error but don't cache (or cache if it's a 4xx)
                return from(this.idempotency.releaseLock(idempotencyKey)).pipe(
                  switchMap(() => throwError(() => err)),
                );
              }),
            );
          }),
        );
      }),
    );
  }
}
