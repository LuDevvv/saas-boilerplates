import { pgTable, text, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";

export const systemConfig = pgTable("system_config", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
  updatedBy: uuid("updated_by"),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type NewSystemConfig = typeof systemConfig.$inferInsert;
