import { Injectable, Inject } from "@nestjs/common";
import { eq, desc, and, gte, lte, like, type SQL } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import type { AuditAction } from "../audit-actions.js";
import * as schema from "../schema/index.js";
import { DB_TOKEN } from "../tokens.js";

type AuditLog = typeof schema.auditLogs.$inferSelect;
type NewAuditLog = typeof schema.auditLogs.$inferInsert;
// Tighten the action column to the AuditAction taxonomy union from
// @node-stack/types (see ADR 0002). A typo at the call site fails
// the typecheck instead of landing as a stray string in production.
export type NewAuditLogInput = Omit<NewAuditLog, "action"> & { action: AuditAction };
type Tx = NodePgDatabase<typeof schema>;

@Injectable()
export class AuditLogRepository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: Tx,
  ) {}

  async create(data: NewAuditLogInput, tx?: Tx): Promise<AuditLog> {
    const database = tx ?? this.db;
    const [log] = await database
      .insert(schema.auditLogs)
      .values(data)
      .returning();
    return log;
  }

  async findByWorkspace(workspaceId: string, options: { limit: number; offset: number }, tx?: Tx): Promise<AuditLog[]> {
    const database = tx ?? this.db;
    return database.query.auditLogs.findMany({
      where: eq(schema.auditLogs.workspaceId, workspaceId),
      limit: options.limit,
      offset: options.offset,
      orderBy: [desc(schema.auditLogs.createdAt)],
    });
  }

  async findByUser(userId: string, options: { limit: number; offset: number }, tx?: Tx): Promise<AuditLog[]> {
    const database = tx ?? this.db;
    return database.query.auditLogs.findMany({
      where: eq(schema.auditLogs.userId, userId),
      limit: options.limit,
      offset: options.offset,
      orderBy: [desc(schema.auditLogs.createdAt)],
    });
  }

  /** Cross-workspace admin query — bypasses RLS via withSystemTx at call site. */
  async findGlobal(
    options: {
      limit: number;
      offset: number;
      action?: string;
      userId?: string;
      workspaceId?: string;
      from?: Date;
      to?: Date;
    },
    tx?: Tx,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const database = tx ?? this.db;

    const conditions: SQL[] = [];
    if (options.action) conditions.push(like(schema.auditLogs.action, `%${options.action}%`));
    if (options.userId) conditions.push(eq(schema.auditLogs.userId, options.userId));
    if (options.workspaceId) conditions.push(eq(schema.auditLogs.workspaceId, options.workspaceId));
    if (options.from) conditions.push(gte(schema.auditLogs.createdAt, options.from));
    if (options.to) conditions.push(lte(schema.auditLogs.createdAt, options.to));

    const where = conditions.length > 0 ? and(...(conditions as [SQL, ...SQL[]])) : undefined;

    const [logs, countResult] = await Promise.all([
      database.query.auditLogs.findMany({
        where,
        limit: options.limit,
        offset: options.offset,
        orderBy: [desc(schema.auditLogs.createdAt)],
      }),
      database.select({ count: schema.auditLogs.id }).from(schema.auditLogs).where(where),
    ]);

    return { logs, total: countResult.length };
  }
}
