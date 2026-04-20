import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { workspaces } from "./workspaces";

export const aiLogs = pgTable(
  "ai_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").references(() => workspaces.id, {
      onDelete: "cascade",
    }).notNull(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    model: text("model").notNull(),
    provider: text("provider").notNull(),
    inputTokens: integer("input_tokens").default(0).notNull(),
    outputTokens: integer("output_tokens").default(0).notNull(),
    prompt: text("prompt"), // Optional: store the prompt for debugging
    response: text("response"), // Optional: store the response
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index("idx_ai_logs_workspace_id").on(table.workspaceId),
    userWorkspaceIdx: index("idx_ai_logs_user_workspace").on(table.userId, table.workspaceId),
    createdAtIdx: index("idx_ai_logs_created_at").on(table.createdAt),
    workspaceCreatedAtIdx: index("idx_ai_logs_workspace_created_at").on(
      table.workspaceId,
      table.createdAt,
    ),
  }),
);

export type AiLog = typeof aiLogs.$inferSelect;
export type NewAiLog = typeof aiLogs.$inferInsert;
