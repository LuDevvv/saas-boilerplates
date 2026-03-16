ALTER TABLE "users" RENAME COLUMN "is_verified" TO "email_verified";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_secret" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_recovery_codes" jsonb;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_provider_provider_account_id_unique" UNIQUE("provider","provider_account_id");