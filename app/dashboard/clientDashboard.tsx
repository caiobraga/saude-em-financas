"use client";

import DashboardHeader from "@/components/DashboardHeader";
import { useState } from "react";

interface ClientDashboardProps {
    readonly userEmail: string;
    readonly plan: string;
}

const pages = [
    {
        name: "Dashboard",
        href: "/",
        current: false,
    },
    {
        name: "Forecasters",
        href: "/forecasters",
        current: false,
    },
    {
        name: "Messages",
        href: "/messages",
        current: false,
    },
    {
        name: "Logs",
        href: "/logs",
        current: false,
    },
];

export default function ClientDashboard({ userEmail, plan }: ClientDashboardProps) {
    const [page, setPage] = useState("Dashboard");

    return (
        <div className="container">
            <DashboardHeader page={page} pagesList={pages} plan={plan} setPage={setPage} />
            <h1>Hello, {userEmail}</h1>

            <div>
                <p>Current Page: {page}</p>
            </div>
        </div>
    );
}
