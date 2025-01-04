'use server'

import { db } from '@/utils/db/db'
import { classes, classes_sections, whatched_video_by_user } from '@/utils/db/schema'
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm'
import { createClient } from '@/utils/supabase/client';

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

export async function insertClass(formData: FormData) {
    try {
        console.log("formData", formData);
        const response = await db.insert(classes).values({
            id: uuidv4(),
            section_id: formData.get('section_id') as string,
            video_id: formData.get('video_id') as string,
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
        return db.select().from(classes);
    } catch (error) {
        return []
    }
}

export async function deleteClass(currentState: { message: string }, formData: FormData) {
    try {
        const result = await db.delete(classes).where(eq(classes.id, formData.get('id') as string));
        console.log(result);
    } catch (error) {
        return { message: error }
    }
}

export async function videoUploadorEdit(formData: FormData) {
    try {
        const supabase = createClient();

        const video_id_inicial = formData.get('video_id') as string | null;
        const class_id = formData.get('id') as string | null;
        const section_id = formData.get('section_id') as string;

        if (video_id_inicial && class_id) {
            await deleteVideo(video_id_inicial, class_id, section_id);
        }

        // Extract data from FormData
        const file = formData.get('file') as File;
        console.log('section_id:', section_id);
        console.log('file:', file);
        if (!section_id || !file) {
            throw new Error('Missing required data: section_id or file');
        }
        const video_id = uuidv4();
        const filePath = `${section_id}/${video_id}.mp4`;

        const { data, error } = await supabase.storage.from('classes').upload(filePath, file);

        if (error) {
            return { message: error.message };
        }
        formData.set('video_id', video_id);

        await insertClass(formData);

        console.log('File uploaded successfully:', data);
        return data;
    } catch (error) {
        console.error('Error during video upload:', error);
        return { message: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
}

export async function deleteVideo(video_id: string, class_id: string, section_id: string) {
    try {
        const supabase = createClient();
        const filePath = `${section_id}/${video_id}.mp4`;

        const { data, error } = await supabase.storage.from('classes').remove([filePath]);

        if (error) {
            return { message: error.message };
        }

        let formData = new FormData();
        formData.set('id', class_id);

        return await deleteClass({ message: '' }, formData);

    } catch (error) {
        console.error('Error deleting video:', error);
        return { message: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
}

export async function getVideosFromSectionId(section_id: string) {
    try {
        const supabase = createClient();
        const filePath = `classes/${section_id}/`;

        const { data, error } = await supabase
            .storage
            .from(filePath)
            .list('');

        if (error) {
            console.error('Error fetching videos:', error);
            return [];
        }

        return data;
    } catch (error) {
        return []
    }
}

export async function getWatchedVideosByUser(userEmail: string) {
    try {
        const response = await db.select().from(whatched_video_by_user).where(eq(whatched_video_by_user.user_email, userEmail));
        if (response) {
            return response;
        }
        return [];
    } catch (error) {
        return []
    }
}

export async function insertWatchedVideo(formData: FormData) {
    try {
        const watched = formData.get('watched') as string;
        console.log("watched", watched);
        const response = await db.insert(whatched_video_by_user).values({
            id: uuidv4(),
            user_email: formData.get('user_email') as string,
            video_id: formData.get('video_id') as string,
            watched: formData.get('watched') as string,
            created_at: new Date(),
            updated_at: new Date(),
        });
        console.log("response", response);

    } catch (error) {
        console.log("error", error);
        return { message: error }
    }
}

export async function updateWatchedVideo(formData: FormData) {
    try {
        const response = await db.update(whatched_video_by_user).set({
            user_email: formData.get('user_email') as string,
            video_id: formData.get('video_id') as string,
            watched: formData.get('watched') as string,
            updated_at: new Date()
        }).where(eq(whatched_video_by_user.id, formData.get('id') as string));
        console.log(response);
    } catch (error) {
        return { message: error }
    }
}