import { Injectable, Inject } from "@nestjs/common";
import { and, eq, gt, ne, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DB_TOKEN } from "../tokens";
import * as schema from "../schema";

@Injectable()
export class SessionRepository {
  constructor(
    @Inject(DB_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findActiveByUserId(
    userId: string,
  ): Promise<any[]> {
    return this.db
      .select()
      .from(schema.sessions)
      .where(
        and(
          eq(schema.sessions.userId, userId),
          gt(schema.sessions.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(schema.sessions.lastUsedAt ?? schema.sessions.createdAt));
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
}
