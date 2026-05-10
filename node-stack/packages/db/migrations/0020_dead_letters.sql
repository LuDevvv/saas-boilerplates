CREATE TABLE "dead_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_queue" text NOT NULL,
	"original_job_type" text NOT NULL,
	"original_job_id" text,
	"payload" jsonb,
	"failed_reason" text,
	"attempts_made" integer DEFAULT 0 NOT NULL,
	"failed_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_dead_letters_queue" ON "dead_letters" USING btree ("original_queue");
--> statement-breakpoint
CREATE INDEX "idx_dead_letters_failed_at" ON "dead_letters" USING btree ("failed_at");
--> statement-breakpoint
CREATE INDEX "idx_dead_letters_resolved_at" ON "dead_letters" USING btree ("resolved_at") WHERE "dead_letters"."resolved_at" IS NULL;
