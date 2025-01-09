CREATE TABLE "apointments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "avaliable_times" (
	"id" text PRIMARY KEY NOT NULL,
	"days_of_the_week" text[],
	"time_start" text NOT NULL,
	"time_end" text,
	"time_before_request" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"title" text NOT NULL,
	"link" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recess_times" (
	"id" text PRIMARY KEY NOT NULL,
	"days_of_the_week" text[],
	"time_start" text NOT NULL,
	"time_end" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
