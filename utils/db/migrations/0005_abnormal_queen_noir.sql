CREATE TABLE "classes" (
	"id" text PRIMARY KEY NOT NULL,
	"section_id" text NOT NULL,
	"video_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
