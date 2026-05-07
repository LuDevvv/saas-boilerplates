import { Injectable, Inject } from "@nestjs/common";
import { and, eq, gt, lt, ne, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DB_TOKEN } from "../tokens.js";
import * as schema from "../schema/index.js";

@Injectable()
export class SessionRepository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findActiveByUserId(
    userId: string,
  ): Promise<(typeof schema.sessions.$inferSelect)[]> {
    return this.db
      .select()
      .from(schema.sessions)
      .where(
        and(
          eq(schema.sessions.userId, userId),
          gt(schema.sessions.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(schema.sessions.lastUsedAt));
  }

  async deleteById(sessionId: string, userId: string): Promise<void> {
    // userId check prevents one user from deleting another's session
    await this.db
      .delete(schema.sessions)
      .where(
        and(
          eq(schema.sessions.id, sessionId),
          eq(schema.sessions.userId, userId),
        ),
      );
  }

  async deleteAllExcept(userId: string, keepSessionId: string): Promise<void> {
    await this.db
      .delete(schema.sessions)
      .where(
        and(
          eq(schema.sessions.userId, userId),
          ne(schema.sessions.id, keepSessionId),
        ),
      );
  }

  async deleteAll(userId: string): Promise<void> {
    await this.db
      .delete(schema.sessions)
      .where(eq(schema.sessions.userId, userId));
  }

  async deleteExpired(): Promise<number> {
    const result = await this.db
      .delete(schema.sessions)
      .where(lt(schema.sessions.expiresAt, new Date()))
      .returning({ id: schema.sessions.id });
    return result.length;
  }
}
