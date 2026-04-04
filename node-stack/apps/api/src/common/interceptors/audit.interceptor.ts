import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { AuditService } from "../services/audit.service";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const actorId = req?.user?.id ?? null;
    const actorType = req?.user?.role ?? "user";
    const method = req?.method ?? "GET";
    const path = (req?.route?.path || req?.path || req?.url || "/").replace(
      /:(\w+)/g,
      "/$1",
    );
    const payload = {
      path,
      body: req?.body,
      query: req?.query,
    };

    return next.handle().pipe(
      map((data) => {
        this.audit.logEvent({
          event: `http.${method.toLowerCase()}.${path}`,
          actorId,
          actorType,
          payload,
        });
        return data;
      }),
    );
  }
}
