"use client";

interface PostsProps {
    readonly userEmail: string;
    readonly plan: string;
    readonly access_level: 'user' | 'admin';
}

export default function Posts({ userEmail, plan, access_level }: PostsProps) {

    return (
        <div className="container">
            <h1>Hello, {userEmail}</h1>
        </div>
    );
}
