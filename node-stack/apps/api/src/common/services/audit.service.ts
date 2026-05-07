import { Injectable, Inject, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import {
  AUDIT_ACTIONS,
  AuditLogRepository,
  DB_TOKEN,
  withSystemTx,
  type AuditAction,
} from "@node-stack/db";
import type { Database } from "@node-stack/db";

// Set of valid taxonomy strings for runtime guard in handleAuditLog.
const AUDIT_ACTION_SET = new Set<string>(AUDIT_ACTIONS);

export interface AuditEventPayload {
  // Permissive at the event boundary so the AuditInterceptor (which
  // emits dynamic http.{method}.{path} strings) and any future
  // request-derived events still flow through. AuditLogRepository.create
  // is strictly typed; handleAuditLog narrows at the bridge.
  action: string;
  userId?: string | null;
  workspaceId?: string | null;
  metadata?: Record<string, any>;
  entityId?: string | null;
  entityType?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

const SENSITIVE_KEYS = ["password", "token", "secret", "apiKey", "credential"];

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly auditLogRepository: AuditLogRepository,
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {}

  @OnEvent("audit.log", { async: true })
  async handleAuditLog(payload: AuditEventPayload) {
    const sanitizedMetadata = this.sanitize(payload.metadata || {});
    const action = this.narrowAction(payload.action);

    try {
      // Audit events arrive from many tenants (and pre-tenant flows).
      // withSystemTx satisfies the audit_logs RLS policy uniformly; the
      // workspaceId column is the row's tenant key, not a query filter.
      await withSystemTx(
        (tx) =>
          this.auditLogRepository.create(
            {
              action,
              userId: payload.userId ?? null,
              workspaceId: payload.workspaceId ?? null,
              metadata: sanitizedMetadata,
              entityId: payload.entityId ?? null,
              entityType: payload.entityType ?? null,
              ipAddress: payload.ipAddress ?? null,
              userAgent: payload.userAgent ?? null,
              createdAt: new Date(),
            },
            tx,
          ),
        this.db,
      );
    } catch (error) {
      console.error("Failed to persist audit log:", error);
    }
  }

  /**
   * Bridge between the permissive event-emitter payload and the strictly
   * typed `AuditLogRepository.create`. Logs a warning when a non-taxonomy
   * action string lands here (e.g. AuditInterceptor's
   * `http.{method}.{path}` strings) and forwards it as-is so existing
   * callers do not regress. Phase 4 candidate: split request-audit from
   * domain-audit so this cast goes away.
   */
  private narrowAction(action: string): AuditAction {
    if (!AUDIT_ACTION_SET.has(action)) {
      this.logger.warn(
        `audit.log received non-taxonomy action "${action}"; widening cast applied`,
      );
    }
    return action as AuditAction;
  }

  // ─── Domain Event Listeners ──────────────────────────────────────────
  //
  // Phase 3b removed the membership.removed / membership.updated /
  // billing.subscription.* listeners. Phase 3c removes the last two
  // (workspace.created and membership.added); both are now written
  // directly inside the originating service's withTenantTx block.
  // No domain-event listeners remain — the audit.log fan-in handler
  // above is the single entry point for ad-hoc and interceptor-emitted
  // events. New events added in future PRs MUST use the direct-write
  // pattern, not @OnEvent listeners.

  /**
   * Legacy method for backward compatibility.
   * Redirects to event-based handling.
   */
  async logEvent(args: {
    event: string;
    actorId?: string | null;
    actorType?: string;
    payload?: unknown;
  }) {
    await this.handleAuditLog({
      action: args.event,
      userId: args.actorId,
      entityType: args.actorType,
      metadata: (args.payload as Record<string, any>) ?? {},
    });
  }

  /**
   * Recursively masks sensitive keys in an object.
   */
  private sanitize(data: any): any {
    if (!data || typeof data !== "object") return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const isSensitive = SENSITIVE_KEYS.some((sk) =>
        key.toLowerCase().includes(sk.toLowerCase()),
      );

      if (isSensitive) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}
