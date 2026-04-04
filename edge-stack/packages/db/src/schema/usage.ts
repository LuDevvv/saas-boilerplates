import {
  pgTable,
  text,
  timestamp,
  uuid,
  bigint,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";

/**
 * Usage Metrics table.
 * Persists high-level quota state for long-term reporting and backup.
 * Edge-level counting is handled via KV, but synced here regularly.
 */
export const usageMetrics = pgTable(
  "usage_metrics",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    metricName: text("metric_name").notNull(), // e.g., 'ai_tokens', 'api_calls', 'storage_kb'
    currentUsage: bigint("current_usage", { mode: "number" })
      .notNull()
      .default(0),
    quotaLimit: bigint("quota_limit", { mode: "number" }).notNull(),
    resetAt: timestamp("reset_at").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.workspaceId, t.metricName] }),
    usageIdx: index("usage_workspace_metric_idx").on(
      t.workspaceId,
      t.metricName,
      t.updatedAt,
    ),
  }),
);

export type UsageMetric = typeof usageMetrics.$inferSelect;
export type NewUsageMetric = typeof usageMetrics.$inferInsert;
