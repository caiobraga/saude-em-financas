CREATE TABLE "classes_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text,
	"order" integer NOT NULL,
	"title" text NOT NULL,
	"teacher" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
