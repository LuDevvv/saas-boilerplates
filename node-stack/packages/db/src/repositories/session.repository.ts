import { Injectable, Inject } from "@nestjs/common";
import { and, eq, gt, lt, ne, or, desc, type SQL } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DB_TOKEN } from "../tokens.js";
import * as schema from "../schema/index.js";

interface ListPageOptions {
  limit: number;
  cursorCreatedAt: Date | null;
  cursorId: string | null;
}

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

  /**
   * Paginated listing for the /auth/sessions endpoint. Ordered by
   * (createdAt DESC, id DESC) for cursor stability — `lastUsedAt` is
   * mutated on every request and would let rows leapfrog across pages.
   */
  async findActiveByUserIdPaged(
    userId: string,
    options: ListPageOptions,
  ): Promise<(typeof schema.sessions.$inferSelect)[]> {
    const conditions: SQL[] = [
      eq(schema.sessions.userId, userId),
      gt(schema.sessions.expiresAt, new Date()),
    ];
    if (options.cursorCreatedAt && options.cursorId) {
      const cursorCondition = or(
        lt(schema.sessions.createdAt, options.cursorCreatedAt),
        and(
          eq(schema.sessions.createdAt, options.cursorCreatedAt),
          lt(schema.sessions.id, options.cursorId),
        ),
      );
      if (cursorCondition) {
        conditions.push(cursorCondition);
      }
    }

    return this.db
      .select()
      .from(schema.sessions)
      .where(and(...conditions))
      .orderBy(desc(schema.sessions.createdAt), desc(schema.sessions.id))
      .limit(options.limit);
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
