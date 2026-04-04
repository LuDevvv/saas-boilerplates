import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Response } from "express";
import { Observable, of, throwError } from "rxjs";
import { tap, catchError } from "rxjs/operators";

import { IdempotencyService } from "../services/idempotency.service";

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(private readonly idempotency: IdempotencyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    if (req.idempotencyCachedResponse) {
      const cached = req.idempotencyCachedResponse;
      res.status(cached.statusCode);
      return of(cached.data);
    }

    if (!req.idempotencyKey) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        const statusCode = res.statusCode;
        await this.idempotency.set(req.idempotencyKey, { statusCode, data });
        await this.idempotency.releaseLock(req.idempotencyKey);
      }),
      catchError((err) => {
        this.idempotency
          .releaseLock(req.idempotencyKey)
          .catch((lockErr) =>
            this.logger.error(
              `Failed to release lock for key ${req.idempotencyKey}`,
              lockErr,
            ),
          );
        return throwError(() => err);
      }),
    );
  }
}
