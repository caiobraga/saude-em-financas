import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
    try {
        const { notificationId, userEmail } = await req.json();

        // Check if the user is authorized
        const { data: user, error: userError } = await supabase
            .from("users_table")
            .select("access_level")
            .eq("email", userEmail)
            .single();

        if (userError || !user || user.access_level !== "admin") {
            return NextResponse.json({ message: `Unaltorized access ${user}` }, { status: 403 });
        }

        // Fetch the notification
        const { data: notification, error: notificationError } = await supabase
            .from("notifications")
            .select("*")
            .eq("id", notificationId)
            .single();

        if (notificationError || !notification) {
            return NextResponse.json({ message: "Notification not found" }, { status: 404 });
        }

        // Fetch all users
        const { data: users, error: userFetchError } = await supabase
            .from("users_table")
            .select("email");

        if (userFetchError || !users) {
            throw new Error("Failed to fetch users");
        }

        // Set up Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Send email to all users
        for (const user of users) {
            await transporter.sendMail({
                from: `"Saúde em Finanças" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: notification.title,
                text: notification.description,
                html: `<p>${notification.description}</p>`,
            });
        }

        return NextResponse.json({ message: "Emails sent successfully" });
    } catch (error: any) {
        console.error("Error sending notifications:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
