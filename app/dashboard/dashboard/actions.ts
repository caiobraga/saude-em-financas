"use server";

import { db } from '@/utils/db/db'
import { apointments, classes, forum_posts, logs, notifications, post_seen_by_user, posts, user_notifications, whatched_video_by_user } from '@/utils/db/schema'
import { eq } from 'drizzle-orm';

export async function getForumPostsByUserEmail(user_email: string) {
    try {
        return db.select().from(forum_posts).where(eq(forum_posts.user_email, user_email));
    } catch (error) {
        return []
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

export async function getUserNotificationOfUser(user_email: string) {
    try {
        const response = await db.select().from(user_notifications).where(eq(user_notifications.user_email, user_email));
        console.log("response", response);
        return response;
    } catch (error) {
        console.log("error", error);
        return []
    }
}


export async function getClasses() {
    try {
        return db.select().from(classes);
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

export async function getPosts() {
    try {
        return db.select().from(posts);
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

export async function getAppointments() {
    try {
        return db.select().from(apointments);
    } catch (error) {
        return []
    }
}

export async function getLogs() {
    try {
        const response = await db.select().from(logs);
        console.log("response", response);
        return response;
    } catch (error) {
        console.log("error", error);
        return []
    }
}


