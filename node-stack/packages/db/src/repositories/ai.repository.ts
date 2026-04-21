import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DB_TOKEN } from "../tokens.js";
import * as schema from "../schema/index.js";
import { BaseRepository } from "./base.repository.js";
import { aiLogs, NewAiLog, AiLog } from "../schema/ai.js";
import { eq, and, desc, gte, sql } from "drizzle-orm";

@Injectable()
export class AiRepository extends BaseRepository<typeof aiLogs.$inferSelect> {
  protected table = aiLogs;
  protected tableName = "aiLogs";

  constructor(@Inject(DB_TOKEN) protected readonly db: NodePgDatabase<typeof schema>) {
    super(db);
  }

  async createLog(data: NewAiLog): Promise<AiLog> {
    const [result] = await this.db.insert(aiLogs).values(data).returning();
    return result;
  }

  async getMonthlyUsage(workspaceId: string, since: Date): Promise<number> {
    const result = await this.db
      .select({
        totalInput: sql<string>`sum(${aiLogs.inputTokens})`,
        totalOutput: sql<string>`sum(${aiLogs.outputTokens})`,
      })
      .from(aiLogs)
      .where(and(eq(aiLogs.workspaceId, workspaceId), gte(aiLogs.createdAt, since)));

    const input = result[0]?.totalInput ? parseInt(result[0].totalInput) : 0;
    const output = result[0]?.totalOutput ? parseInt(result[0].totalOutput) : 0;
    
    return input + output;
  }

  async findByWorkspace(workspaceId: string, limit = 50): Promise<AiLog[]> {
    return this.db
      .select()
      .from(aiLogs)
      .where(eq(aiLogs.workspaceId, workspaceId))
      .orderBy(desc(aiLogs.createdAt))
      .limit(limit);
  }

  async findByUserInWorkspace(
    userId: string,
    workspaceId: string,
    limit = 50,
  ): Promise<AiLog[]> {
    return this.db
      .select()
      .from(aiLogs)
      .where(
        and(eq(aiLogs.userId, userId), eq(aiLogs.workspaceId, workspaceId)),
      )
      .orderBy(desc(aiLogs.createdAt))
      .limit(limit);
  }
}
