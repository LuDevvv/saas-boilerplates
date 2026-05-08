import { pgTable, uuid, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const deadLetters = pgTable("dead_letters", {
  id: uuid("id").primaryKey().defaultRandom(),
  originalQueue: text("original_queue").notNull(),
  originalJobType: text("original_job_type").notNull(),
  originalJobId: text("original_job_id"),
  payload: jsonb("payload"),
  failedReason: text("failed_reason"),
  attemptsMade: integer("attempts_made").notNull().default(0),
  failedAt: timestamp("failed_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: uuid("resolved_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type DeadLetter = typeof deadLetters.$inferSelect;
export type NewDeadLetter = typeof deadLetters.$inferInsert;
