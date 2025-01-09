"use client";
import DashboardHeader from "@/components/DashboardHeader";
import { useState } from "react";


interface ClientDashboardProps {
    readonly userEmail: string;
    readonly plan: string;
    readonly access_level: 'user' | 'admin';
    readonly dashboard: React.ReactNode;
    readonly classes: React.ReactNode;
    readonly forum: React.ReactNode;
    readonly posts: React.ReactNode;
    readonly events: React.ReactNode;
}

const pages = [
    {
        name: "Dashboard",
        href: "/",
        current: false,
    },
    {
        name: "Events",
        href: "/events",
        current: false,
    },
    {
        name: "Classes",
        href: "/classes",
        current: false,
    },
    {
        name: "Fórum",
        href: "/forum",
        current: false,
    },
    {
        name: "Posts",
        href: "/posts",
        current: false,
    },
];

export default function ClientDashboard({ userEmail, plan, access_level, dashboard, classes,
    forum,
    posts, events }: ClientDashboardProps) {
    const [page, setPage] = useState("Dashboard");

    return (
        <div className="container">
            <DashboardHeader page={page} pagesList={pages} plan={plan} setPage={setPage} access_level={access_level} user_email={userEmail} />

            {
                page === "Dashboard" && (
                    dashboard
                )
            }
            {
                page === "Events" && (
                    events
                )
            }
            {
                page === "Classes" && (
                    classes
                )
            }
            {
                page === "Fórum" && (
                    forum
                )
            }
            {
                page === "Posts" && (
                    posts
                )
            }
        </div>
    );
}