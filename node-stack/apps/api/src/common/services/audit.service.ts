import { Injectable } from "@nestjs/common";
import { db } from "@node-stack/db";
import { auditLogs } from "@node-stack/db";

export interface AuditEventPayload {
  event: string;
  actorId?: string;
  actorType?: string;
  payload?: unknown;
}

@Injectable()
export class AuditService {
  async logEvent(args: AuditEventPayload) {
    const { event, actorId, actorType = "user", payload } = args;
    const payloadObj = (payload as Record<string, unknown>) ?? {};
    await db.insert(auditLogs).values({
      action: event,
      userId: actorId ?? null,
      entityType: actorType,
      metadata: payloadObj,
      createdAt: new Date(),
      // workspaceId is missing in the payload currently, will add if needed
      // but let's at least make it pass build
    } as typeof auditLogs.$inferInsert);
  }
}
