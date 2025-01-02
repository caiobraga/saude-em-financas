"use client";

interface ForumProps {
    readonly userEmail: string;
    readonly plan: string;
    readonly access_level: 'user' | 'admin';
}

export default function Forum({ userEmail, plan, access_level }: ForumProps) {

    return (
        <div className="container">
            <h1>Hello, {userEmail}</h1>
        </div>
    );
}
