import { Injectable, Inject } from "@nestjs/common";
import { eq, ne, and, sql, gte, count, gt, isNull, lte, lt } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DB_TOKEN } from "../tokens.js";
import * as schema from "../schema/index.js";

@Injectable()
export class AnalyticsRepository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  // ─── Workspace-scoped ───────────────────────────────────────────────────────

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
      .where(and(eq(schema.aiLogs.workspaceId, workspaceId), gte(schema.aiLogs.createdAt, startDate)))
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
      .where(and(eq(schema.files.workspaceId, workspaceId), ne(schema.files.status, "deleted")));
    return { totalBytes: Number(result?.totalBytes || 0), fileCount: Number(result?.fileCount || 0) };
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
      .where(and(eq(schema.auditLogs.workspaceId, workspaceId), gte(schema.auditLogs.createdAt, startDate)))
      .groupBy(sql`date`)
      .orderBy(sql`date`);
  }

  // ─── Global / system-wide ───────────────────────────────────────────────────

  async getUserCount(): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(schema.users)
      .where(isNull(schema.users.deletedAt));
    return Number(result?.count || 0);
  }

  async getActiveSessionsCount(): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(schema.sessions)
      .where(gt(schema.sessions.expiresAt, new Date()));
    return Number(result?.count || 0);
  }

  /** Users with a session active in the last 24 h — DAU proxy */
  async getDauCount(): Promise<number> {
    const yesterday = new Date(Date.now() - 86_400_000);
    const [result] = await this.db
      .select({ count: sql<number>`count(distinct ${schema.sessions.userId})` })
      .from(schema.sessions)
      .where(and(gt(schema.sessions.lastUsedAt, yesterday), gt(schema.sessions.expiresAt, new Date())));
    return Number(result?.count || 0);
  }

  /** User counts by role */
  async getUsersByRole(): Promise<{ role: string; count: number }[]> {
    const rows = await this.db
      .select({ role: schema.users.role, count: count() })
      .from(schema.users)
      .where(isNull(schema.users.deletedAt))
      .groupBy(schema.users.role);
    return rows.map((r) => ({ role: r.role, count: Number(r.count) }));
  }

  /** User counts by status */
  async getUsersByStatus(): Promise<{ status: string; count: number }[]> {
    const rows = await this.db
      .select({ status: schema.users.status, count: count() })
      .from(schema.users)
      .where(isNull(schema.users.deletedAt))
      .groupBy(schema.users.status);
    return rows.map((r) => ({ status: r.status as string, count: Number(r.count) }));
  }

  /** New users registered in the last N days */
  async getNewUsersCount(days: number = 7): Promise<number> {
    const since = new Date(Date.now() - days * 86_400_000);
    const [result] = await this.db
      .select({ count: count() })
      .from(schema.users)
      .where(and(isNull(schema.users.deletedAt), gte(schema.users.createdAt, since)));
    return Number(result?.count || 0);
  }

  /** Daily new-user registrations for the last N days */
  async getUserGrowthTrend(days: number = 30): Promise<{ date: string; count: number }[]> {
    const since = new Date(Date.now() - days * 86_400_000);
    const rows = await this.db
      .select({
        date: sql<string>`date_trunc('day', ${schema.users.createdAt})::date`.as("date"),
        count: count(),
      })
      .from(schema.users)
      .where(and(isNull(schema.users.deletedAt), gte(schema.users.createdAt, since)))
      .groupBy(sql`date`)
      .orderBy(sql`date`);
    return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  /** Daily global audit-log activity for the last N days */
  async getGlobalActivityTrend(days: number = 30): Promise<{ date: string; count: number }[]> {
    const since = new Date(Date.now() - days * 86_400_000);
    const rows = await this.db
      .select({
        date: sql<string>`date_trunc('day', ${schema.auditLogs.createdAt})::date`.as("date"),
        count: count(),
      })
      .from(schema.auditLogs)
      .where(gte(schema.auditLogs.createdAt, since))
      .groupBy(sql`date`)
      .orderBy(sql`date`);
    return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  /** Global AI usage — per provider/model */
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

  /** Global AI token usage per day for the last N days */
  async getGlobalAiTrend(days: number = 30): Promise<{ date: string; tokens: number; calls: number }[]> {
    const since = new Date(Date.now() - days * 86_400_000);
    const rows = await this.db
      .select({
        date: sql<string>`date_trunc('day', ${schema.aiLogs.createdAt})::date`.as("date"),
        tokens: sql<number>`sum(${schema.aiLogs.inputTokens} + ${schema.aiLogs.outputTokens})`,
        calls: count(),
      })
      .from(schema.aiLogs)
      .where(gte(schema.aiLogs.createdAt, since))
      .groupBy(sql`date`)
      .orderBy(sql`date`);
    return rows.map((r) => ({ date: r.date, tokens: Number(r.tokens), calls: Number(r.calls) }));
  }

  /** Global total AI tokens over last N days */
  async getTotalAiTokens(days: number = 30): Promise<number> {
    const since = new Date(Date.now() - days * 86_400_000);
    const [result] = await this.db
      .select({ total: sql<number>`sum(${schema.aiLogs.inputTokens} + ${schema.aiLogs.outputTokens})` })
      .from(schema.aiLogs)
      .where(gte(schema.aiLogs.createdAt, since));
    return Number(result?.total || 0);
  }

  /** Global storage across all workspaces */
  async getGlobalStorageUsage(): Promise<{ totalBytes: number; fileCount: number }> {
    const [result] = await this.db
      .select({
        totalBytes: sql<number>`cast(coalesce(sum(${schema.files.size}), 0) as bigint)`,
        fileCount: count(),
      })
      .from(schema.files)
      .where(ne(schema.files.status, "deleted"));
    return { totalBytes: Number(result?.totalBytes || 0), fileCount: Number(result?.fileCount || 0) };
  }

  /** Workspace counts by tier */
  async getWorkspacesByTier(): Promise<{ tier: string; count: number }[]> {
    const rows = await this.db
      .select({ tier: schema.workspaces.tier, count: count() })
      .from(schema.workspaces)
      .where(isNull(schema.workspaces.deletedAt))
      .groupBy(schema.workspaces.tier);
    return rows.map((r) => ({ tier: r.tier as string, count: Number(r.count) }));
  }

  async getWorkspaceCount(): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(schema.workspaces)
      .where(isNull(schema.workspaces.deletedAt));
    return Number(result?.count || 0);
  }

  async getNewWorkspacesCount(days: number = 30): Promise<number> {
    const since = new Date(Date.now() - days * 86_400_000);
    const [result] = await this.db
      .select({ count: count() })
      .from(schema.workspaces)
      .where(and(isNull(schema.workspaces.deletedAt), gte(schema.workspaces.createdAt, since)));
    return Number(result?.count || 0);
  }

  /** Subscription counts by status */
  async getSubscriptionsByStatus(): Promise<{ status: string; count: number }[]> {
    const rows = await this.db
      .select({ status: schema.subscriptions.status, count: count() })
      .from(schema.subscriptions)
      .groupBy(schema.subscriptions.status);
    return rows.map((r) => ({ status: r.status as string, count: Number(r.count) }));
  }

  async getActiveSubscriptionsCount(): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.status, "active"));
    return Number(result?.count || 0);
  }

  /** Ticket counts by status */
  async getTicketsByStatus(): Promise<{ status: string; count: number }[]> {
    const rows = await this.db
      .select({ status: schema.tickets.status, count: count() })
      .from(schema.tickets)
      .where(isNull(schema.tickets.deletedAt))
      .groupBy(schema.tickets.status);
    return rows.map((r) => ({ status: r.status as string, count: Number(r.count) }));
  }

  /** Task counts by status */
  async getTasksByStatus(): Promise<{ status: string; count: number }[]> {
    const rows = await this.db
      .select({ status: schema.tasks.status, count: count() })
      .from(schema.tasks)
      .groupBy(schema.tasks.status);
    return rows.map((r) => ({ status: r.status as string, count: Number(r.count) }));
  }

  /** Tasks completed in the last N days */
  async getTasksCompletedRecently(days: number = 7): Promise<number> {
    const since = new Date(Date.now() - days * 86_400_000);
    const [result] = await this.db
      .select({ count: count() })
      .from(schema.tasks)
      .where(and(eq(schema.tasks.status, "done"), gte(schema.tasks.completedAt, since)));
    return Number(result?.count || 0);
  }

  /** Top N workspaces by AI token usage in last 30 days */
  async getTopWorkspacesByAiUsage(limit: number = 5): Promise<{ workspaceId: string; tokens: number }[]> {
    const since = new Date(Date.now() - 30 * 86_400_000);
    const rows = await this.db
      .select({
        workspaceId: schema.aiLogs.workspaceId,
        tokens: sql<number>`sum(${schema.aiLogs.inputTokens} + ${schema.aiLogs.outputTokens})`,
      })
      .from(schema.aiLogs)
      .where(gte(schema.aiLogs.createdAt, since))
      .groupBy(schema.aiLogs.workspaceId)
      .orderBy(sql`tokens desc`)
      .limit(limit);
    return rows.map((r) => ({ workspaceId: r.workspaceId, tokens: Number(r.tokens) }));
  }
}
