import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

import { workspaces } from "./workspaces";
import { users } from "./users";

export const portabilityStatusEnum = pgEnum("portability_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "expired",
]);

export const portabilityRequests = pgTable("portability_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: portabilityStatusEnum("status").notNull().default("pending"),
  metadata: jsonb("metadata").$type<{
    fileSize?: number;
    sizeBytes?: number;
    fileKey?: string;
    errorReason?: string;
    expiresAt?: string;
    deletedAt?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
});

export type PortabilityRequest = typeof portabilityRequests.$inferSelect;
export type NewPortabilityRequest = typeof portabilityRequests.$inferInsert;
