CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"password" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_number" text NOT NULL,
	"channel_name" text NOT NULL,
	"questionnaire_id" uuid,
	"uv_count" integer DEFAULT 0,
	"questionnaire_submit_count" integer DEFAULT 0,
	"remark" text,
	"short_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "channels_channel_number_unique" UNIQUE("channel_number"),
	CONSTRAINT "channels_short_link_unique" UNIQUE("short_link")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_number" text NOT NULL,
	"customer_name" text NOT NULL,
	"application_amount" text,
	"province" text,
	"city" text,
	"district" text,
	"phone_number" text,
	"id_card" text,
	"submission_time" timestamp,
	"questionnaire_id" uuid,
	"channel_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_customer_number_unique" UNIQUE("customer_number")
);
--> statement-breakpoint
CREATE TABLE "questionnaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"questionnaire_number" text NOT NULL,
	"questionnaire_name" text NOT NULL,
	"remark" text,
	"questions" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "questionnaires_questionnaire_number_unique" UNIQUE("questionnaire_number")
);
--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_questionnaire_id_questionnaires_id_fk" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_questionnaire_id_questionnaires_id_fk" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON DELETE no action ON UPDATE no action;