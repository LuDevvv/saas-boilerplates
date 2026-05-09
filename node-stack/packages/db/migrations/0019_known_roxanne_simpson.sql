CREATE TYPE "public"."workspace_tier" AS ENUM('free', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."portability_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('pending', 'active', 'inactive', 'deleted');--> statement-breakpoint
ALTER TYPE "public"."membership_status" ADD VALUE 'removed';--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"push_enabled" boolean DEFAULT true NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portability_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "portability_status" DEFAULT 'pending' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"source" text DEFAULT 'marketing_site',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "ticket_status" DEFAULT 'pending' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "notification_preferences" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "notification_preferences" CASCADE;--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "provider" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "provider" SET DEFAULT 'polar'::text;--> statement-breakpoint
DROP TYPE "public"."billing_provider";--> statement-breakpoint
CREATE TYPE "public"."billing_provider" AS ENUM('polar', 'mock');--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "provider" SET DEFAULT 'polar'::"public"."billing_provider";--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "provider" SET DATA TYPE "public"."billing_provider" USING "provider"::"public"."billing_provider";--> statement-breakpoint
ALTER TABLE "inbound_webhook_logs" ALTER COLUMN "provider" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."webhook_provider";--> statement-breakpoint
CREATE TYPE "public"."webhook_provider" AS ENUM('polar', 'clerk', 'generic');--> statement-breakpoint
ALTER TABLE "inbound_webhook_logs" ALTER COLUMN "provider" SET DATA TYPE "public"."webhook_provider" USING "provider"::"public"."webhook_provider";--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "body" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deletion_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "anonymized_at" timestamp;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "tier" "workspace_tier" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "deletion_reason" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "remember_me" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "data" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "read_at" timestamp;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portability_requests" ADD CONSTRAINT "portability_requests_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portability_requests" ADD CONSTRAINT "portability_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_notification_settings_user_id" ON "notification_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_waitlist_email" ON "waitlist" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_ticket_workspace" ON "tickets" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_status" ON "tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_ticket_created_by" ON "tickets" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_ticket_workspace_status" ON "tickets" USING btree ("workspace_id","status");--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_deleted_at" ON "users" USING btree ("deleted_at") WHERE "users"."deleted_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_workspaces_deleted_at" ON "workspaces" USING btree ("deleted_at") WHERE "workspaces"."deleted_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_files_user_id" ON "files" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ai_logs_workspace_created_at" ON "ai_logs" USING btree ("workspace_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_workspace_user" ON "notifications" USING btree ("workspace_id","user_id");--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "channel";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "subject";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "provider_info";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "error";--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN "updated_at";--> statement-breakpoint
DROP TYPE "public"."notification_channel";--> statement-breakpoint
DROP TYPE "public"."notification_status";--> statement-breakpoint
DROP TYPE "public"."notification_type";