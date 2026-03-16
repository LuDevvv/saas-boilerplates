import { eq, and, gt } from "drizzle-orm";
import type { Database } from "../db";
import { sessions, type Session, type NewSession } from "../schema/auth";

/**
 * Repository for managing user sessions (Refresh Tokens).
 */
export const SessionRepository = {
  /**
   * Creates a new session.
   * @param db - Database instance
   * @param data - Session data
   */
  async create(db: Database, data: NewSession): Promise<Session> {
    const result = await db.insert(sessions).values(data).returning();
    if (!result[0]) throw new Error("Failed to create session");
    return result[0];
  },

  /**
   * Finds a valid session by ID.
   * @param db - Database instance
   * @param id - Session ID (the refresh token)
   */
  async findValid(db: Database, id: string): Promise<Session | null> {
    const result = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())))
      .limit(1);

    return result[0] || null;
  },

  /**
   * Deletes a session by ID.
   * @param db - Database instance
   * @param id - Session ID
   */
  async delete(db: Database, id: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  },

  /**
   * Deletes all sessions for a user.
   * @param db - Database instance
   * @param userId - User ID
   */
  async deleteByUserId(db: Database, userId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  },
};
