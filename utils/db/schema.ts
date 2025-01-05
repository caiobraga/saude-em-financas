import { integer, pgTable, text, timestamp, PgArray } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users_table', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    plan: text('plan').notNull(),
    stripe_id: text('stripe_id').notNull(),
    access_level: text('access_level').notNull(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export const classes_sections = pgTable('classes_sections', {
    id: text('id').primaryKey(),
    parent_id: text('parent_id'),
    order: integer('order').notNull(),
    title: text('title').notNull(),
    description: text('teacher').notNull(),
    created_at: timestamp('created_at').notNull(),
    updated_at: timestamp('updated_at').notNull(),
});

export type InsertClassesSections = typeof classes_sections.$inferInsert;
export type SelectClassesSections = typeof classes_sections.$inferSelect;

export const classes = pgTable('classes', {
    id: text('id').primaryKey(),
    section_id: text('section_id').notNull(),
    video_id: text('video_id').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    order: integer('order').notNull(),
    created_at: timestamp('created_at').notNull(),
    updated_at: timestamp('updated_at').notNull(),
});

export type InsertClasses = typeof classes.$inferInsert;
export type SelectClasses = typeof classes.$inferSelect;

export const posts_sections = pgTable('posts_sections', {
    id: text('id').primaryKey(),
    parent_id: text('parent_id'),
    order: integer('order').notNull(),
    title: text('title').notNull(),
    description: text('teacher').notNull(),
    created_at: timestamp('created_at').notNull(),
    updated_at: timestamp('updated_at').notNull(),
});

export type InsertPostsSections = typeof posts_sections.$inferInsert;
export type SelectPostsSections = typeof posts_sections.$inferSelect;

export const posts = pgTable('posts', {
    id: text('id').primaryKey(),
    section_id: text('section_id').notNull(),
    post_id: text('video_id').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    order: integer('order').notNull(),
    created_at: timestamp('created_at').notNull(),
    updated_at: timestamp('updated_at').notNull(),
});

export type InsertPosts = typeof posts.$inferInsert;
export type SelectPosts = typeof posts.$inferSelect;

export const forum_table = pgTable('forum_table', {
    id: text('id').primaryKey(),
    parent_id: text('parent_id'),
    order: integer('order').notNull(),
    title: text('title').notNull(),
    description: text('teacher').notNull(),
    created_at: timestamp('created_at').notNull(),
    updated_at: timestamp('updated_at').notNull(),
});

export type InsertForumTable = typeof forum_table.$inferInsert;
export type SelectForumTable = typeof forum_table.$inferSelect;

export const forum_posts = pgTable('forum_posts', {
    id: text('id').primaryKey(),
    parent_id: text('parent_id'),
    table_id: text('table_id').notNull(),
    user_email: text('user_email').notNull(),
    user_name: text('user_name').notNull(),
    title: text('title').notNull(),
    likes: integer('likes').notNull(),
    likedBy: text('likedBy').array().notNull(),
    description: text('description').notNull(),
    order: integer('order').notNull(),
    created_at: timestamp('created_at').notNull(),
    updated_at: timestamp('updated_at').notNull(),
});

export const whatched_video_by_user = pgTable('whatched_video_by_user', {
    id: text('id').primaryKey(),
    user_email: text('user_email').notNull(),
    video_id: text('video_id').notNull(),
    watched: text('watched').notNull(),
    created_at: timestamp('created_at').notNull(),
    updated_at: timestamp('updated_at').notNull(),
});

export type InsertWhatchedVideoByUser = typeof whatched_video_by_user.$inferInsert;
export type SelectWhatchedVideoByUser = typeof whatched_video_by_user.$inferSelect;

export const post_seen_by_user = pgTable('post_seen_by_user', {
    id: text('id').primaryKey(),
    user_email: text('user_email').notNull(),
    post_id: text('post_id').notNull(),
    seen: text('seen').notNull(),
    created_at: timestamp('created_at').notNull(),
    updated_at: timestamp('updated_at').notNull(),
});

export const logs = pgTable('logs', {
    id: text('id').primaryKey(),
    user_email: text('user_email').notNull(),
    action: text('action').notNull(),
    created_at: timestamp('created_at').notNull(),
    updated_at: timestamp('updated_at').notNull(),
});

export type InsertLogs = typeof logs.$inferInsert;
export type SelectLogs = typeof logs.$inferSelect;

export const notifications = pgTable('notifications', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    created_at: timestamp('created_at').notNull(),
    updated_at: timestamp('updated_at').notNull(),
});

export type InsertNotifications = typeof notifications.$inferInsert;
export type SelectNotifications = typeof notifications.$inferSelect;

export const user_notifications = pgTable('user_notifications', {
    id: text('id').primaryKey(),
    user_email: text('user_email').notNull(),
    notification_id: text('notification_id').notNull(),
    seen: text('seen').notNull(),
    created_at: timestamp('created_at').notNull(),
    updated_at: timestamp('updated_at').notNull(),
});

export type InsertUserNotifications = typeof user_notifications.$inferInsert;
export type SelectUserNotifications = typeof user_notifications.$inferSelect;