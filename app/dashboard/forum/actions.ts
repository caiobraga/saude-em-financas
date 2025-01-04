'use server'

import { db } from '@/utils/db/db'
import { forum_table, forum_posts, whatched_video_by_user } from '@/utils/db/schema'
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';


export async function insertForumTable(parent_id: string | null, formData: FormData) {
    try {
        console.log("formData", formData);
        const response = await db.insert(forum_table).values({
            id: uuidv4(),
            parent_id: parent_id,
            order: Number(formData.get('order')) || 0,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            created_at: new Date(),
            updated_at: new Date(),
        });
        console.log("response", response);

    } catch (error) {
        console.log("error", error);
        return { message: error }
    }
}

export async function updateForumTable(parent_id: string | null, formData: FormData) {
    try {
        const response = await db.update(forum_table).set({
            parent_id: parent_id,
            order: Number(formData.get('order')),
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            updated_at: new Date()
        }).where(eq(forum_table.id, formData.get('id') as string));
        console.log(response);
    } catch (error) {
        return { message: error }
    }
}

export async function deleteForumTable(currentState: { message: string }, formData: FormData) {
    try {
        const result = await db.delete(forum_table).where(eq(forum_table.id, formData.get('id') as string));
        console.log(result);
    } catch (error) {
        return { message: error }
    }
}

export async function getForumTable() {
    try {
        return db.select().from(forum_table);
    } catch (error) {
        return []
    }
}

export async function insertForumPosts(parent_id: string | null, formData: FormData) {
    try {
        const choices = formData.get('liked_by') as string | undefined;
        const likedBy = choices != null ? choices.split(',') : [];

        const response = await db.insert(forum_posts).values({
            id: uuidv4(),
            parent_id: parent_id,
            order: Number(formData.get('order')) || 0,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            likedBy: likedBy,
            likes: Number(formData.get('likes')) || 0,
            user_name: formData.get('user_name') as string,
            user_email: formData.get('user_email') as string,
            table_id: formData.get('table_id') as string,
            created_at: new Date(),
            updated_at: new Date(),
        });
        console.log("response", response);

    } catch (error) {
        console.log("error", error);
        return { message: error }
    }
}

export async function updateForumPosts(parent_id: string | null, formData: FormData) {
    try {
        const choices = formData.get('liked_by') as string | undefined;
        const likedBy = choices != null ? choices.split(',') : [];

        const response = await db.update(forum_posts).set({
            parent_id: parent_id,
            order: Number(formData.get('order')),
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            likedBy: likedBy,
            likes: Number(formData.get('likes')),
            user_name: formData.get('user_name') as string,
            user_email: formData.get('user_email') as string,
            table_id: formData.get('table_id') as string,
            updated_at: new Date()
        }).where(eq(forum_posts.id, formData.get('id') as string));
        console.log(response);
    } catch (error) {
        return { message: error }
    }
}

export async function deleteForumPosts(currentState: { message: string }, formData: FormData) {
    try {
        const result = await db.delete(forum_posts).where(eq(forum_posts.id, formData.get('id') as string));
        console.log(result);
    } catch (error) {
        return { message: error }
    }
}

export async function getForumPosts() {
    try {
        return db.select().from(forum_posts);
    } catch (error) {
        return []
    }
}

export async function getForumPostsByTableId(table_id: string) {
    try {
        return db.select().from(forum_posts).where(eq(forum_posts.table_id, table_id));
    } catch (error) {
        return []
    }
}

