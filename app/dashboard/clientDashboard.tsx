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

}

const pages = [
    {
        name: "Dashboard",
        href: "/",
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
    posts }: ClientDashboardProps) {
    const [page, setPage] = useState("Dashboard");

    return (
        <div className="container">
            <DashboardHeader page={page} pagesList={pages} plan={plan} setPage={setPage} />
            <div>
                <p>Current Page: {page}</p>
            </div>
            {
                page === "Dashboard" && (
                    dashboard
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