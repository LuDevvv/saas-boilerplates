import { Injectable, Inject } from "@nestjs/common";
import { eq, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DB_TOKEN } from "../tokens";
import * as schema from "../schema";

type AuditLog = typeof schema.auditLogs.$inferSelect;
type NewAuditLog = typeof schema.auditLogs.$inferInsert;
type Tx = NodePgDatabase<typeof schema>;

@Injectable()
export class AuditLogRepository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: Tx,
  ) {}

  async create(data: NewAuditLog, tx?: Tx): Promise<AuditLog> {
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
}
