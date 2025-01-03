'use server'

import { db } from '@/utils/db/db'
import { posts, posts_sections } from '@/utils/db/schema'
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm'
import { createClient } from '@/utils/supabase/client';

export async function insertSection(parent_id: string | null, formData: FormData) {
    try {
        console.log("formData", formData);
        const response = await db.insert(posts_sections).values({
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

export async function updateSection(parent_id: string | null, formData: FormData) {
    try {
        const response = await db.update(posts_sections).set({
            parent_id: parent_id,
            order: Number(formData.get('order')),
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            updated_at: new Date()
        }).where(eq(posts_sections.id, formData.get('id') as string));
        console.log(response);
    } catch (error) {
        return { message: error }
    }
}

export async function deleteSection(currentState: { message: string }, formData: FormData) {
    try {
        const result = await db.delete(posts_sections).where(eq(posts_sections.id, formData.get('id') as string));
        console.log(result);
    } catch (error) {
        return { message: error }
    }
}

export async function getSections() {
    try {
        return db.select().from(posts_sections);
    } catch (error) {
        return []
    }
}

export async function insertClass(formData: FormData) {
    try {
        console.log("formData", formData);
        const response = await db.insert(posts).values({
            id: uuidv4(),
            section_id: formData.get('section_id') as string,
            post_id: formData.get('post_id') as string,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            order: Number(formData.get('order')) || 0,
            created_at: new Date(),
            updated_at: new Date(),
        });
        console.log("response", response);

    } catch (error) {
        console.log("error", error);
        return { message: error }
    }
}


export async function getClasses() {
    try {
        return db.select().from(posts);
    } catch (error) {
        return []
    }
}

export async function deleteClass(currentState: { message: string }, formData: FormData) {
    try {
        const result = await db.delete(posts).where(eq(posts.id, formData.get('id') as string));
        console.log(result);
    } catch (error) {
        return { message: error }
    }
}

export async function postUpload(formData: FormData) {
    try {
        const supabase = createClient();

        // Extract data from FormData
        const section_id = formData.get('section_id') as string;
        const file = formData.get('file') as File;
        console.log('section_id:', section_id);
        console.log('file:', file);
        if (!section_id || !file) {
            throw new Error('Missing required data: section_id or file');
        }
        const post_id = uuidv4();
        const filePath = `${section_id}/${post_id}.pdf`;

        const { data, error } = await supabase.storage.from('posts').upload(filePath, file);

        if (error) {
            return { message: error.message };
        }
        formData.set('post_id', post_id);

        await insertClass(formData);

        console.log('File uploaded successfully:', data);
        return data;
    } catch (error) {
        console.error('Error during post upload:', error);
        return { message: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
}

export async function getpostsFromSectionId(section_id: string) {
    try {
        const supabase = createClient();
        const filePath = `posts/${section_id}/`;

        const { data, error } = await supabase
            .storage
            .from(filePath)
            .list('');

        if (error) {
            console.error('Error fetching posts:', error);
            return [];
        }

        return data;
    } catch (error) {
        return []
    }
}
