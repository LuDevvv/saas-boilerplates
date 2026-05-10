-- Migration 0023: Onboarding status + job title on users; industry/team/revenue on workspaces

CREATE TYPE "public"."onboarding_status" AS ENUM('started', 'step_1_completed', 'completed');--> statement-breakpoint

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "job_title" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_status" "onboarding_status" NOT NULL DEFAULT 'started';--> statement-breakpoint

ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "industry" text;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "team_size" text;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "revenue_range" text;
