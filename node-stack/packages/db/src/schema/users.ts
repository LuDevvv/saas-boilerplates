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

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "banned",
]);

export const onboardingStatusEnum = pgEnum("onboarding_status", [
  "started",
  "step_1_completed",
  "completed",
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
    status: userStatusEnum("status").notNull().default("active"),
    statusReason: text("status_reason"),
    statusChangedAt: timestamp("status_changed_at"),
    statusChangedBy: uuid("status_changed_by"),
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
    jobTitle: text("job_title"),
    onboardingStatus: onboardingStatusEnum("onboarding_status").notNull().default("started"),
    deletedAt: timestamp("deleted_at"),
    deletedBy: uuid("deleted_by"),
    deletionReason: text("deletion_reason"),
    anonymizedAt: timestamp("anonymized_at"),
  },
  (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
    // Partial index — the cron's only consumer scans for non-null
    // deleted_at to find rows past the 30-day grace window.
    deletedAtIdx: index("idx_users_deleted_at")
      .on(table.deletedAt)
      .where(sql`${table.deletedAt} IS NOT NULL`),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
