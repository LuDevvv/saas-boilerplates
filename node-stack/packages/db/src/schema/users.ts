import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "admin",
  "super_admin",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash"),
    name: text("name"),
    lastName: text("last_name"),
    avatarUrl: text("avatar_url"),
    phone: text("phone"),
    role: userRoleEnum("role").notNull().default("user"),
    emailVerified: boolean("email_verified").notNull().default(false),
    twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
    twoFactorSecret: text("two_factor_secret"),
    twoFactorRecoveryCodes: jsonb("two_factor_recovery_codes").$type<
      string[]
    >(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`now()`),
  },
  (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
