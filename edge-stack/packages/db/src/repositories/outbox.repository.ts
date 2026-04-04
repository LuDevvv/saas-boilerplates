import { eq, sql } from "drizzle-orm";
import type { Database } from "../db";
import { outbox, type NewOutboxEvent, type OutboxEvent } from "../schema/outbox";

/**
 * Repository for managing the transactional outbox.
 */
export const OutboxRepository = {
  /**
   * Persists a new event to the outbox.
   * Usually called within a transaction.
   */
  async createEvent(db: Database, data: NewOutboxEvent): Promise<OutboxEvent> {
    const [result] = await db.insert(outbox).values(data).returning();
    if (!result) throw new Error("Failed to create outbox event");
    return result;
  },

  /**
   * Retrieves unprocessed events.
   */
  async getPendingEvents(db: Database, limit = 10): Promise<OutboxEvent[]> {
    return await db
      .select()
      .from(outbox)
      .where(eq(outbox.processed, false))
      .limit(limit)
      .orderBy(outbox.createdAt);
  },

  /**
   * Marks an event as processed.
   */
  async markAsProcessed(db: Database, id: string): Promise<void> {
    await db
      .update(outbox)
      .set({
        processed: true,
        processedAt: sql`now()`,
      })
      .where(eq(outbox.id, id));
  },
};
