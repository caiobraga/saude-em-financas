"use server";
import { db } from '@/utils/db/db';
import { logs, notifications, user_notifications } from '@/utils/db/schema'
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

export async function getLogs() {
    try {
        const response = await db.select().from(logs);
        console.log("response", response);
        return response;
    } catch (error) {
        console.log("error", error);
        return { message: error }
    }
}

export async function insertNotification(title: string, description: string, user_email: string) {
    try {
        const notification_id = uuidv4();
        const insert_response = await db.insert(notifications).values({
            id: notification_id,
            title: title,
            description: description,
            created_at: new Date(),
            updated_at: new Date(),
        });
        console.log("insert_response", insert_response);

        const response = await fetch("/api/send-notification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                notificationId: notification_id,
                userEmail: user_email,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to send notification");
        }

        const result = await response.json();
        console.log("Success:", result.message);

    } catch (error) {
        console.log("error", error);
        return null;
    }
}

export async function getNotifications() {
    try {
        const response = await db.select().from(notifications);
        console.log("response", response);
        return response;
    } catch (error) {
        console.log("error", error);
        return []
    }
}

export async function getUserNotification() {
    try {
        const response = await db.select().from(user_notifications);
        console.log("response", response);
        return response;
    } catch (error) {
        console.log("error", error);
        return []
    }
}

export async function insertUserNotification(user_email: string, notification_id: string) {
    try {
        const response = await db.insert(user_notifications).values({
            id: uuidv4(),
            user_email: user_email,
            notification_id: notification_id,
            seen: 'true',
            created_at: new Date(),
            updated_at: new Date(),
        });
        console.log("response", response);

    } catch (error) {
        console.log("error", error);
        return { message: error }
    }
}