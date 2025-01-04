"use server";
import { db } from '@/utils/db/db';
import { logs } from '@/utils/db/schema'
import { v4 as uuidv4 } from 'uuid';

export async function insertLog(user_email: string, action: string) {
    try {
        const response = await db.insert(logs).values({
            id: uuidv4(),
            user_email: user_email,
            action: action,
            created_at: new Date(),
            updated_at: new Date(),
        });
        console.log("response", response);

    } catch (error) {
        console.log("error", error);
        return { message: error }
    }
}