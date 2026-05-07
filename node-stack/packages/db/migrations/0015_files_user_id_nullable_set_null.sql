ALTER TABLE "files" DROP CONSTRAINT "files_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_files_user_id" ON "files" USING btree ("user_id");
