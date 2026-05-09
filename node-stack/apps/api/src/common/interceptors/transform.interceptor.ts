import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface Response<T> {
  data: T;
  meta: {
    timestamp: string;
    [key: string]: unknown;
  };
}

interface TransformRequest {
  url?: string;
  requestId?: string;
  headers?: Record<string, string | string[] | undefined>;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<TransformRequest>();

    // Skip transformation for certain paths if needed (e.g. documentation)
    const url = request.url ?? "";
    if (url.includes("/api/docs") || url.includes("/health")) {
      return next.handle() as Observable<Response<T>>;
    }

    return next.handle().pipe(
      map((data: T) => ({
        data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: request.requestId ?? (request.headers?.["x-request-id"] as string | undefined),
        },
      })),
    );
  }
}
