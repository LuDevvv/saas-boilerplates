CREATE TYPE "public"."inbound_webhook_status" AS ENUM('received', 'validated', 'rejected', 'processed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."webhook_provider" AS ENUM('stripe', 'polar', 'clerk', 'generic');--> statement-breakpoint
CREATE TABLE "inbound_webhook_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "webhook_provider" NOT NULL,
	"provider_event_id" varchar(512) NOT NULL,
	"event_type" varchar(255) NOT NULL,
	"headers" jsonb,
	"raw_payload" text,
	"parsed_payload" jsonb,
	"status" "inbound_webhook_status" DEFAULT 'received' NOT NULL,
	"signature_valid" boolean,
	"error_message" text,
	"internal_event_name" varchar(255),
	"processing_attempts" integer DEFAULT 0 NOT NULL,
	"source_ip" varchar(45),
	"response_status" integer,
	"processing_duration_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "idx_inbound_wh_provider_event" ON "inbound_webhook_logs" USING btree ("provider","provider_event_id");--> statement-breakpoint
CREATE INDEX "idx_inbound_wh_provider" ON "inbound_webhook_logs" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_inbound_wh_status" ON "inbound_webhook_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_inbound_wh_event_type" ON "inbound_webhook_logs" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_inbound_wh_created_at" ON "inbound_webhook_logs" USING btree ("created_at");