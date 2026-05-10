DROP INDEX "idx_api_keys_prefix";--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "key_hash" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "last_used_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "key_preview" varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_api_keys_key_hash" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
ALTER TABLE "api_keys" DROP COLUMN "prefix";--> statement-breakpoint
ALTER TABLE "api_keys" DROP COLUMN "scopes";--> statement-breakpoint
ALTER TABLE "api_keys" DROP COLUMN "revoked";