import { pgTable, serial, varchar, timestamp, json } from "drizzle-orm/pg-core";

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  event: varchar("event", { length: 128 }).notNull(),
  actor_id: varchar("actor_id", { length: 128 }),
  actor_type: varchar("actor_type", { length: 32 }),
  entity: varchar("entity", { length: 128 }),
  entity_id: varchar("entity_id", { length: 128 }),
  payload: json("payload"),
  created_at: timestamp("created_at").defaultNow(),
});
