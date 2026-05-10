-- Soft-delete columns on users and workspaces, plus a 'removed'
-- membership_status enum value for cascading workspace closure.
-- Per ADR 0003: users are anonymized after 30 days, workspaces are
-- hard-deleted after 30 days. The deleted_at partial indexes cover
-- the cron scan path.

ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deletion_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "anonymized_at" timestamp;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_deleted_at" ON "users" ("deleted_at") WHERE "deleted_at" IS NOT NULL;--> statement-breakpoint

ALTER TABLE "workspaces" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "deletion_reason" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_workspaces_deleted_at" ON "workspaces" ("deleted_at") WHERE "deleted_at" IS NOT NULL;--> statement-breakpoint

ALTER TYPE "membership_status" ADD VALUE IF NOT EXISTS 'removed';
