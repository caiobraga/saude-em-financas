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
CREATE TABLE "classes" (
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
CREATE TABLE "classes_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text,
	"order" integer NOT NULL,
	"title" text NOT NULL,
	"teacher" text NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "recess_times" (
	"id" text PRIMARY KEY NOT NULL,
	"days_of_the_week" text[],
	"time_start" text NOT NULL,
	"time_end" text,
	"date_begin" text NOT NULL,
	"date_end" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"notification_id" text NOT NULL,
	"seen" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_table" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"plan" text NOT NULL,
	"stripe_id" text NOT NULL,
	"access_level" text NOT NULL,
	CONSTRAINT "users_table_email_unique" UNIQUE("email")
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
