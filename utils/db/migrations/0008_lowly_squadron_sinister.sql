CREATE TABLE "forum_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text,
	"table_id" text NOT NULL,
	"user_email" text NOT NULL,
	"user_name" text NOT NULL,
	"title" text NOT NULL,
	"likes" integer NOT NULL,
	"likedBy" text[] NOT NULL,
	"description" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_table" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text,
	"order" integer NOT NULL,
	"title" text NOT NULL,
	"teacher" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
