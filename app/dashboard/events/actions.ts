"use server";

import { db } from '@/utils/db/db';
import {
    avaliable_times,
    recess_times,
    events,
    apointments,
    appointments_credits,
} from '@/utils/db/schema';
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';
import { google, calendar_v3 } from 'googleapis';
import { user } from '@nextui-org/react';



const stripe_products = {
    "credits": process.env.STRIPE_CREDITS_PRODUCT_ID,
    "saude_em_financas": process.env.STRIPE_SAUDE_EM_FINANCAS_PRODUCT_ID,
};

export async function buyCredits(user_email: string, credits: number) {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const product_id = stripe_products["credits"];
        const price = credits * 100; // Convert to cents
        const response = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: product_id,
                quantity: credits,
            }],
            customer_email: user_email,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/dashboard?success=true&credits=${credits}`,
            cancel_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/dashboard?canceled=true`,
        });
        return response;
    } catch (error) {
        console.error("Error buying credits:", error);
        return { message: error };
    }
}

export async function buySaudeEmFinancas(user_email: string) {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const product_id = stripe_products["saude_em_financas"];
        const response = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: product_id,
                quantity: 1,
            }],
            customer_email: user_email,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/dashboard?success=true&credits=1`,
            cancel_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/dashboard?canceled=true`,
            metadata: { user_email: user_email },
        });
        return response;
    } catch (error) {
        return { message: error };
    }
}

const SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.events.readonly",
];

export async function initGoogleCalendar() {
    try {
        const credentials = {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            project_id: process.env.GOOGLE_PROJECT_ID,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };
        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: SCOPES,
        });

        return google.calendar({ version: "v3", auth });
    } catch (error) {
        console.error("Error initializing Google Calendar API:", error);
    }
}

export async function createGoogleCalendarEvent(data: {
    date: string;
    time: string;
    summary: string;
    description: string;
}) {
    try {
        const calendar = await initGoogleCalendar();

        const eventDetails: calendar_v3.Schema$Event = {
            summary: data.summary,
            description: data.description,
            start: {
                dateTime: `${data.date}T${data.time}:00`,
                timeZone: "America/New_York",
            },
            end: {
                dateTime: `${data.date}T${(parseInt(data.time.split(":")[0], 10) + 1)
                    .toString()
                    .padStart(2, "0")}:00:00`,
                timeZone: "America/New_York",
            },
            /*conferenceData: {
                createRequest: {
                    requestId: `${data.date}-${data.time}-request`,
                    conferenceSolutionKey: {
                        type: "hangoutsMeet",
                    },
                },
            },*/
        };

        if (!calendar) {
            return { success: false, error: "Failed to initialize Google Calendar API" };
        }

        const response = await calendar.events.insert({
            calendarId: process.env.CALENDAR_ID!,
            requestBody: eventDetails,
            conferenceDataVersion: 1, // Ensure conference data is included
        });

        return {
            success: true,
            link: response.data.hangoutLink, // This will return the Google Meet link
        };
    } catch (error) {
        console.error("Error creating Google Calendar event:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}




// Helper function to safely parse FormData values
function getFormDataValue(formData: FormData, key: string) {
    const value = formData.get(key);
    if (typeof value === 'string') {
        return value;
    }
    throw new Error(`Expected a string for key '${key}', but got ${typeof value}`);
}

// CRUD for avaliable_times
export async function getAvaliableTimes() {
    try {
        const response = await db.select().from(avaliable_times);
        return response;
    } catch (error) {
        return [];
    }
}

export async function insertAvaliableTime(formData: FormData) {
    try {
        const days = formData.get('days_of_the_week') as string | undefined;
        let days_of_the_week = days ? days.split(',') : null;
        if (days_of_the_week && days_of_the_week[0] === '') {
            days_of_the_week = null;
        }

        const time_start = formData.get('time_start') as string | undefined;
        const time_end = formData.get('time_end') as string | undefined;
        const time_before_request = formData.get('time_before_request') as string | undefined;

        console.log(days_of_the_week, time_start, time_end, time_before_request);

        if (!time_start || !time_before_request) {
            return { message: 'Missing required fields' };
        }

        const response = await db.insert(avaliable_times).values({
            id: uuidv4(),
            days_of_the_week: days_of_the_week,
            time_start: time_start,
            time_end: time_end,
            time_before_request: time_before_request,
            created_at: new Date(),
            updated_at: new Date(),
        });

        return { success: true, data: response }; // Return plain object
    } catch (error) {
        return { message: error instanceof Error ? error.message : 'An error occurred' };
    }
}


export async function updateAvaliableTime(id: string, formData: FormData) {
    try {
        const days = formData.get('days_of_the_week') as string | undefined;
        let days_of_the_week = days ? days.split(',') : null;
        if (days_of_the_week && days_of_the_week[0] === '') {
            days_of_the_week = null;
        }
        const response = await db.update(avaliable_times).set({
            days_of_the_week: days_of_the_week,
            time_start: getFormDataValue(formData, 'time_start'),
            time_end: getFormDataValue(formData, 'time_end'),
            time_before_request: getFormDataValue(formData, 'time_before_request'),
            updated_at: new Date(),
        }).where(eq(avaliable_times.id, id));
        return response;
    } catch (error) {
        return { message: error };
    }
}

export async function deleteAvaliableTime(id: string) {
    try {
        const response = await db.delete(avaliable_times).where(eq(avaliable_times.id, id));
        return response;
    } catch (error) {
        return { message: error };
    }
}

// CRUD for recess_times
export async function getRecessTimes() {
    try {
        const response = await db.select().from(recess_times);
        return response;
    } catch (error) {
        return [];
    }
}

export async function insertRecessTime(formData: FormData) {
    try {
        await db.insert(recess_times).values({
            id: uuidv4(),
            days_of_the_week: getFormDataValue(formData, 'days_of_the_week').split(','),
            time_start: getFormDataValue(formData, 'time_start'),
            time_end: getFormDataValue(formData, 'time_end'),
            date_begin: new Date(getFormDataValue(formData, 'date_begin')),
            date_end: new Date(getFormDataValue(formData, 'date_end')),
            created_at: new Date(),
            updated_at: new Date(),
        });
    } catch (error) {
        return { message: error };
    }
}

export async function updateRecessTime(id: string, formData: FormData) {
    try {
        const response = await db.update(recess_times).set({
            days_of_the_week: getFormDataValue(formData, 'days_of_the_week').split(','),
            time_start: getFormDataValue(formData, 'time_start'),
            time_end: getFormDataValue(formData, 'time_end'),
            updated_at: new Date(),
        }).where(eq(recess_times.id, id));
        return response;
    } catch (error) {
        return { message: error };
    }
}

export async function deleteRecessTime(id: string) {
    try {
        const response = await db.delete(recess_times).where(eq(recess_times.id, id));
        return response;
    } catch (error) {
        return { message: error };
    }
}

// CRUD for events
export async function getEvents() {
    try {
        const response = await db.select().from(events);
        return response;
    } catch (error) {
        return [];
    }
}

export async function insertEvent(formData: FormData) {
    try {
        await db.insert(events).values({
            id: uuidv4(),
            date: getFormDataValue(formData, 'date'),
            time: getFormDataValue(formData, 'time'),
            title: getFormDataValue(formData, 'title'),
            link: getFormDataValue(formData, 'link'),
            description: getFormDataValue(formData, 'description'),
            created_at: new Date(),
            updated_at: new Date(),
        });
    } catch (error) {
        return { message: error };
    }
}

export async function updateEvent(id: string, formData: FormData) {
    try {
        const response = await db.update(events).set({
            date: getFormDataValue(formData, 'date'),
            time: getFormDataValue(formData, 'time'),
            title: getFormDataValue(formData, 'title'),
            description: getFormDataValue(formData, 'description'),
            updated_at: new Date(),
        }).where(eq(events.id, id));
        return response;
    } catch (error) {
        return { message: error };
    }
}

export async function deleteEvent(id: string) {
    try {
        const response = await db.delete(events).where(eq(events.id, id));
        return response;
    } catch (error) {
        return { message: error };
    }
}

// CRUD for apointments
export async function getAppointments() {
    try {
        const response = await db.select().from(apointments);
        return response;
    } catch (error) {
        return [];
    }
}

export async function getUserApoitments(user_email: string) {
    try {
        const response = await db.select().from(apointments).where(eq(apointments.user_email, user_email));
        return response;
    } catch (error) {
        return [];
    }
}

export async function getAppointmentsOfTheDay(date_appoit: string) {
    try {
        const response = await db.select().from(apointments).where(eq(apointments.date, date_appoit));
        return response;
    } catch (error) {
        return [];
    }
}

export async function insertAppointment(formData: FormData) {
    try {
        const response = await db.insert(apointments).values({
            id: uuidv4(),
            user_email: getFormDataValue(formData, 'user_email'),
            date: getFormDataValue(formData, 'date'),
            time: getFormDataValue(formData, 'time'),
            created_at: new Date(),
            updated_at: new Date(),
        });
        return response;
    } catch (error) {
        return { message: error };
    }
}

export async function updateAppointment(id: string, formData: FormData) {
    try {
        const response = await db.update(apointments).set({
            user_email: getFormDataValue(formData, 'user_email'),
            date: getFormDataValue(formData, 'date'),
            time: getFormDataValue(formData, 'time'),
            updated_at: new Date(),
        }).where(eq(apointments.id, id));
        return response;
    } catch (error) {
        return { message: error };
    }
}

export async function deleteAppointment(id: string) {
    try {
        const response = await db.delete(apointments).where(eq(apointments.id, id));
        return response;
    } catch (error) {
        return { message: error };
    }
}

export async function getUserCredits(user_email: string) {
    try {
        const response = await db.select().from(appointments_credits).where(eq(appointments_credits.user_email, user_email));
        return response.length;
    } catch (error) {
        return 0;
    }
}

export async function insertUserCredits(user_email: string, credits: number) {
    try {
        const response = await db.insert(appointments_credits).values({
            id: uuidv4(),
            user_email: user_email,
            credits: credits,
            created_at: new Date(),
            updated_at: new Date(),
        });
        return response;
    } catch (error) {
        return { message: error };
    }
}

export async function updateUserCredits(user_email: string, credits: number) {
    try {
        const response = await db.update(appointments_credits).set({
            credits: credits,
            updated_at: new Date(),
        }).where(eq(appointments_credits.user_email, user_email));
        return response;
    } catch (error) {
        return { message: error };
    }
}

