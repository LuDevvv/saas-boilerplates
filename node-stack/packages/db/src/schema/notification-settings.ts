import { sql } from "drizzle-orm";
import { pgTable, uuid, boolean, index, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const notificationSettings = pgTable(
  "notification_settings",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    emailEnabled: boolean("email_enabled").notNull().default(true),
    pushEnabled: boolean("push_enabled").notNull().default(true),
    inAppEnabled: boolean("in_app_enabled").notNull().default(true),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`now()`),
  },
  (table) => ({
    userIdIdx: index("idx_notification_settings_user_id").on(table.userId),
  })
);

export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type NewNotificationSettings = typeof notificationSettings.$inferInsert;
