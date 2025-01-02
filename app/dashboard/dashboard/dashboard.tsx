"use client";

interface DashboardProps {
    readonly userEmail: string;
    readonly plan: string;
    readonly access_level: 'user' | 'admin';
}

export default function Dashboard({ userEmail, plan, access_level }: DashboardProps) {

    return (
        <div className="container">
            <h1>Hello, {userEmail}</h1>
        </div>
    );
}
