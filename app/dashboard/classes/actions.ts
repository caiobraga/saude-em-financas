'use server'

import { db } from '@/utils/db/db'
import { classes_sections } from '@/utils/db/schema'
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm'

export async function insertSection(parent_id: string | null, formData: FormData) {
    try {
        console.log("formData", formData);
        const response = await db.insert(classes_sections).values({
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
        const response = await db.update(classes_sections).set({
            parent_id: parent_id,
            order: Number(formData.get('order')),
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            updated_at: new Date()
        }).where(eq(classes_sections.id, formData.get('id') as string));
        console.log(response);
    } catch (error) {
        return { message: error }
    }
}

export async function deleteSection(currentState: { message: string }, formData: FormData) {
    try {
        const result = await db.delete(classes_sections).where(eq(classes_sections.id, formData.get('id') as string));
        console.log(result);
    } catch (error) {
        return { message: error }
    }
}

export async function getSections() {
    try {
        return db.select().from(classes_sections);
    } catch (error) {
        return []
    }
}