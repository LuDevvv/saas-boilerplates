import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { MetricsService } from "@/metrics/metrics.service.js";

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req?.method ?? "GET";
    const path = (req?.route?.path || req?.path || req?.url || "/").replace(
      /:(\w+)/g,
      "/$1",
    );
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const status = String(res?.statusCode ?? 200);
        const duration = (Date.now() - start) / 1000;

        this.metrics.httpRequestsTotal.inc({ method, path, status });
        this.metrics.httpRequestDurationSeconds.observe(
          { method, path },
          duration,
        );
      }),
    );
  }
}
