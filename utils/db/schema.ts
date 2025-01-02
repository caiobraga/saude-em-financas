import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

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