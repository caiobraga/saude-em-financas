CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"section_id" text NOT NULL,
	"video_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text,
	"order" integer NOT NULL,
	"title" text NOT NULL,
	"teacher" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
