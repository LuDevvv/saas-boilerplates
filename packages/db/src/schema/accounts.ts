import { pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Accounts table schema.
 * Stores linked OAuth providers for users (Google, Facebook).
 */
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(), // 'google' or 'facebook'
    providerAccountId: text("provider_account_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    providerProviderAccountIdUnique: unique().on(
      table.provider,
      table.providerAccountId,
    ),
  }),
);

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
