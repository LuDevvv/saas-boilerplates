import { Injectable, Inject } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { AuditLogRepository, DB_TOKEN, withSystemTx } from "@node-stack/db";
import type { Database } from "@node-stack/db";

export interface AuditEventPayload {
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
  constructor(
    private readonly auditLogRepository: AuditLogRepository,
    @Inject(DB_TOKEN) private readonly db: Database,
  ) {}

  @OnEvent("audit.log", { async: true })
  async handleAuditLog(payload: AuditEventPayload) {
    const sanitizedMetadata = this.sanitize(payload.metadata || {});

    try {
      // Audit events arrive from many tenants (and pre-tenant flows).
      // withSystemTx satisfies the audit_logs RLS policy uniformly; the
      // workspaceId column is the row's tenant key, not a query filter.
      await withSystemTx(
        (tx) =>
          this.auditLogRepository.create(
            {
              action: payload.action,
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

  // ─── Domain Event Listeners ──────────────────────────────────────────

  @OnEvent("workspace.created", { async: true })
  async onWorkspaceCreated(payload: any) {
    await this.handleAuditLog({
      action: "workspace.created",
      userId: payload.userId,
      workspaceId: payload.workspaceId,
      entityType: "workspace",
      entityId: payload.workspaceId,
      metadata: payload,
    });
  }

  @OnEvent("membership.added", { async: true })
  async onMembershipAdded(payload: any) {
    await this.handleAuditLog({
      action: "membership.added",
      userId: payload.actorId,
      workspaceId: payload.workspaceId,
      entityType: "user",
      entityId: payload.userId,
      metadata: payload,
    });
  }

  @OnEvent("membership.removed", { async: true })
  async onMembershipRemoved(payload: any) {
    await this.handleAuditLog({
      action: "membership.removed",
      userId: payload.actorId,
      workspaceId: payload.workspaceId,
      entityType: "user",
      entityId: payload.userId,
      metadata: payload,
    });
  }

  @OnEvent("membership.updated", { async: true })
  async onMembershipUpdated(payload: any) {
    await this.handleAuditLog({
      action: "membership.updated",
      userId: payload.actorId,
      workspaceId: payload.workspaceId,
      entityType: "user",
      entityId: payload.userId,
      metadata: payload,
    });
  }

  @OnEvent("billing.subscription.*", { async: true })
  async onSubscriptionEvent(payload: any) {
    await this.handleAuditLog({
      action: "billing.subscription.update",
      workspaceId: payload.workspaceId,
      entityType: "subscription",
      entityId: payload.subscriptionId,
      metadata: payload,
    });
  }

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
