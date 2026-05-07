import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces.js";
import { users } from "./users.js";

export const fileStatusEnum = pgEnum("file_status", [
  "pending",
  "uploaded",
  "failed",
  "deleted",
]);

export const fileProviderEnum = pgEnum("file_provider", ["s3", "local"]);

export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    key: text("key").notNull(),
    name: text("name").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    provider: fileProviderEnum("provider").notNull(),
    status: fileStatusEnum("status").notNull().default("pending"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`now()`),
  },
  (table) => ({
    workspaceIdx: index("idx_files_workspace_id").on(table.workspaceId),
    keyIdx: index("idx_files_key").on(table.key),
    userIdx: index("idx_files_user_id").on(table.userId),
  }),
);

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
