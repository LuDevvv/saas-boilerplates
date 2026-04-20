import { Injectable, Inject } from "@nestjs/common";
import { eq, ne, and, sql, gte, count, gt } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DB_TOKEN } from "../tokens";
import * as schema from "../schema";

@Injectable()
export class AnalyticsRepository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getAiUsage(workspaceId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.db
      .select({
        date: sql<string>`date_trunc('day', ${schema.aiLogs.createdAt})`.as("date"),
        inputTokens: sql<number>`sum(${schema.aiLogs.inputTokens})`,
        outputTokens: sql<number>`sum(${schema.aiLogs.outputTokens})`,
        count: sql<number>`count(*)`,
      })
      .from(schema.aiLogs)
      .where(
        and(
          eq(schema.aiLogs.workspaceId, workspaceId),
          gte(schema.aiLogs.createdAt, startDate)
        )
      )
      .groupBy(sql`date`)
      .orderBy(sql`date`);
  }

  async getStorageUsage(workspaceId: string) {
    const [result] = await this.db
      .select({
        totalBytes: sql<number>`cast(sum(${schema.files.size}) as bigint)`,
        fileCount: sql<number>`count(*)`,
      })
      .from(schema.files)
      .where(
        and(
          eq(schema.files.workspaceId, workspaceId),
          ne(schema.files.status, "deleted")
        )
      );

    return {
      totalBytes: Number(result?.totalBytes || 0),
      fileCount: Number(result?.fileCount || 0),
    };
  }

  async getActivityTrend(workspaceId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.db
      .select({
        date: sql<string>`date_trunc('day', ${schema.auditLogs.createdAt})`.as("date"),
        count: sql<number>`count(*)`,
      })
      .from(schema.auditLogs)
      .where(
        and(
          eq(schema.auditLogs.workspaceId, workspaceId),
          gte(schema.auditLogs.createdAt, startDate)
        )
      )
      .groupBy(sql`date`)
      .orderBy(sql`date`);
  }

  async getGlobalAiUsage() {
    return this.db
      .select({
        provider: schema.aiLogs.provider,
        model: schema.aiLogs.model,
        totalTokens: sql<number>`sum(${schema.aiLogs.inputTokens} + ${schema.aiLogs.outputTokens})`,
      })
      .from(schema.aiLogs)
      .groupBy(schema.aiLogs.provider, schema.aiLogs.model);
  }

  async getUserCount(): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(schema.users);
    return Number(result?.count || 0);
  }

  async getActiveSessionsCount(): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(schema.sessions)
      .where(gt(schema.sessions.expiresAt, new Date()));
    return Number(result?.count || 0);
  }
}
