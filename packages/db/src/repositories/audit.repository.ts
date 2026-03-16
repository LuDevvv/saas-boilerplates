import { eq } from "drizzle-orm";
import type { Database } from "../db";
import { auditLogs, type AuditLog, type NewAuditLog } from "../schema/audit";

/**
 * Repository for high-fidelity audit trail persistence.
 */
export const AuditRepository = {
  /**
   * Persists a new audit log entry.
   */
  async createLog(db: Database, data: NewAuditLog): Promise<AuditLog> {
    const [result] = await db.insert(auditLogs).values(data).returning();
    if (!result) throw new Error("Failed to create audit log");
    return result;
  },

  /**
   * Retrieves recent logs for a workspace.
   */
  async getWorkspaceLogs(
    db: Database,
    workspaceId: string,
    limit = 50,
  ): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.workspaceId, workspaceId))
      .limit(limit)
      .orderBy(auditLogs.createdAt);
  },
};
