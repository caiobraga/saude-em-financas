'use server'

import { db } from '@/utils/db/db'
import { posts_sections, posts, post_seen_by_user } from '@/utils/db/schema'
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm'
import { createClient } from '@/utils/supabase/client';
import { insertLog } from '../actions';

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


export async function getPosts() {
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

export async function postsUploadorEdit(formData: FormData) {
    try {
        const supabase = createClient();

        const posts_id_inicial = formData.get('post_id') as string | null;
        const class_id = formData.get('id') as string | null;
        const section_id = formData.get('section_id') as string;

        if (posts_id_inicial && class_id) {
            await deleteposts(posts_id_inicial, class_id, section_id);
        }

        // Extract data from FormData
        const file = formData.get('file') as File;
        console.log('section_id:', section_id);
        console.log('file:', file);
        if (!section_id || !file) {
            throw new Error('Missing required data: section_id or file');
        }
        const posts_id = uuidv4();
        const filePath = `${section_id}/${posts_id}.pdf`;

        const { data, error } = await supabase.storage.from('posts').upload(filePath, file);

        if (error) {
            return { message: error.message };
        }
        formData.set('posts_id', posts_id);

        await insertClass(formData);

        console.log('File uploaded successfully:', data);
    } catch (error) {
        console.error('Error during posts upload:', error);
        return { message: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
}

export async function deleteposts(posts_id: string, class_id: string, section_id: string) {
    try {
        const supabase = createClient();
        const filePath = `${section_id}/${posts_id}.mp4`;

        const { data, error } = await supabase.storage.from('posts').remove([filePath]);

        if (error) {
            return { message: error.message };
        }

        let formData = new FormData();
        formData.set('id', class_id);

        return await deleteClass({ message: '' }, formData);

    } catch (error) {
        console.error('Error deleting posts:', error);
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

export async function getpostsSeenByUser(userEmail: string) {
    try {
        const response = await db.select().from(post_seen_by_user).where(eq(post_seen_by_user.user_email, userEmail));
        if (response) {
            return response;
        }
        return [];
    } catch (error) {
        return []
    }
}

export async function insertSeendposts(formData: FormData) {
    try {
        const seen = formData.get('seen') as string;
        console.log("Seend", seen);
        const response = await db.insert(post_seen_by_user).values({
            id: uuidv4(),
            user_email: formData.get('user_email') as string,
            post_id: formData.get('post_id') as string,
            seen: seen,
            created_at: new Date(),
            updated_at: new Date(),
        });

        await insertLog(formData.get('user_email') as string, `posts ${formData.get('posts_name') as string} from class ${formData.get('class_name') as string} Seend: ${formData.get('Seend')} `);

        console.log("response", response);

    } catch (error) {
        console.log("error", error);
        return { message: error }
    }
}

export async function updateSeendposts(formData: FormData) {
    try {
        const response = await db.update(post_seen_by_user).set({
            user_email: formData.get('user_email') as string,
            post_id: formData.get('post_id') as string,
            seen: formData.get('seen') as string,
            updated_at: new Date()
        }).where(eq(post_seen_by_user.id, formData.get('id') as string));

        await insertLog(formData.get('user_email') as string, `posts ${formData.get('posts_name') as string} from class ${formData.get('class_name') as string} Seen: ${formData.get('seen')} `);
        console.log(response);
    } catch (error) {
        return { message: error }
    }
}