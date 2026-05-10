ALTER TABLE "workspace_invitations" ADD COLUMN "token" text NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_invitations_token" ON "workspace_invitations" USING btree ("token");--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_token_unique" UNIQUE("token");