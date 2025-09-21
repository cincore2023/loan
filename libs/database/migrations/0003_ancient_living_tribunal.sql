DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "channels" ADD COLUMN "tags" jsonb;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "selected_questions" jsonb;