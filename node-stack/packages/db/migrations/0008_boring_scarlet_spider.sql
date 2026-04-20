CREATE TYPE "public"."membership_status" AS ENUM('active', 'pending');--> statement-breakpoint
ALTER TYPE "public"."workspace_role" ADD VALUE 'viewer';--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "entity_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "status" "membership_status" DEFAULT 'active' NOT NULL;