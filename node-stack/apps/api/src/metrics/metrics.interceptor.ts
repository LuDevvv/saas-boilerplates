import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import type { Response } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { MetricsService } from "@/metrics/metrics.service.js";

interface RequestWithRoute {
  method?: string;
  route?: { path?: string };
  path?: string;
  url?: string;
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<RequestWithRoute>();
    const method = req?.method ?? "GET";
    const routePath: string | undefined = req?.route?.path;
    const rawPath: string = routePath ?? req?.path ?? req?.url ?? "/";
    const path = rawPath.replace(/:(\w+)/g, "/$1");
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<Response>();
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
