import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { db } from "@node-stack/db";
import { auditLogs } from "@node-stack/db";

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
  /**
   * Listen for 'audit.log' events and persist them to the database.
   */
  @OnEvent("audit.log", { async: true })
  async handleAuditLog(payload: AuditEventPayload) {
    const sanitizedMetadata = this.sanitize(payload.metadata || {});

    try {
      await db.insert(auditLogs).values({
        action: payload.action,
        userId: payload.userId ?? null,
        workspaceId: payload.workspaceId ?? null,
        metadata: sanitizedMetadata,
        entityId: payload.entityId ?? null,
        entityType: payload.entityType ?? null,
        ipAddress: payload.ipAddress ?? null,
        userAgent: payload.userAgent ?? null,
        createdAt: new Date(),
      } as typeof auditLogs.$inferInsert);
    } catch (error) {
      // Background process: avoid throwing to main request
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
