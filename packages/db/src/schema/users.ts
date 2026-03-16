import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Users table schema.
 * Stores core identity and authentication metadata.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"), // Nullable for social accounts
  name: text("name"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("user"),
  emailVerified: boolean("email_verified").notNull().default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorRecoveryCodes: jsonb("two_factor_recovery_codes").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
