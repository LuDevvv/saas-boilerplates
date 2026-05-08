CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'banned');
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status_reason" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status_changed_at" timestamp;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status_changed_by" uuid;
--> statement-breakpoint
CREATE INDEX "idx_users_status" ON "users" USING btree ("status") WHERE "users"."status" != 'active';
