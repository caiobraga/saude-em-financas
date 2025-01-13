CREATE TABLE "appointments_credits" (
	"id" text PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"credits" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
