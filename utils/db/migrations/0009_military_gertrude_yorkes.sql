CREATE TABLE "logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_seen_by_user" (
	"id" text PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"post_id" text NOT NULL,
	"seen" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatched_video_by_user" (
	"id" text PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"video_id" text NOT NULL,
	"watched" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
