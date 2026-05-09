import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

interface AuditRequest {
  user?: { id?: string; activeWorkspaceId?: string };
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
  method?: string;
  route?: { path?: string };
  path?: string;
  url?: string;
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Check for @SkipAudit() or similar if defined, or just check @AuditLog
    const auditMeta = this.reflector.get<string | boolean>(
      "audit",
      context.getHandler(),
    );

    const req = context.switchToHttp().getRequest<AuditRequest>();
    const actorId = req?.user?.id ?? null;
    const workspaceId = req?.user?.activeWorkspaceId ?? req?.params?.["workspaceId"] ?? null;
    const method = req?.method ?? "GET";
    const path = req?.route?.path ?? req?.path ?? req?.url ?? "/";

    // Default action name if @AuditLog(name) is not provided
    let action = `http.${method.toLowerCase()}.${path}`;
    if (typeof auditMeta === "string") {
      action = auditMeta;
    }

    return next.handle().pipe(
      map((data: unknown) => {
        // Only log non-GET requests by default, or if @AuditLog is explicitly present
        const isWriteAction = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

        if (auditMeta || isWriteAction) {
          this.eventEmitter.emit("audit.log", {
            action,
            userId: actorId,
            workspaceId,
            metadata: {
              path,
              method,
              params: req?.params,
              query: req?.query,
              body: req?.body,
            },
            ipAddress: req?.ip,
            userAgent: req?.headers?.["user-agent"],
          });
        }

        return data;
      }),
    );
  }
}
