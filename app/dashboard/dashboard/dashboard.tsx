"use client";

import { useEffect, useState } from 'react';
import {
    getClasses,
    getWatchedVideosByUser,
    getPosts,
    getpostsSeenByUser,
    getLogs
} from './actions';
import ReactPlayer from "react-player";
import { toast } from 'react-toastify';
import { getEvents } from '../events/actions';

interface DashboardProps {
    readonly user_name: string;
    readonly userEmail: string;
    readonly plan: string;
    readonly access_level: 'user' | 'admin';
}

interface Classes {
    id: string;
    section_id: string;
    video_id: string;
    title: string;
    description: string;
    order: number;
    created_at: Date;
    updated_at: Date;
}

interface WhatchedVideoByUser {
    id: string;
    user_email: string;
    video_id: string;
    watched: string;
    created_at: Date;
    updated_at: Date;
}

interface Posts {
    id: string;
    section_id: string;
    post_id: string;
    title: string;
    description: string;
    order: number;
    created_at: Date;
    updated_at: Date;
}

interface WhatchedPostByUser {
    id: string;
    user_email: string;
    post_id: string;
    seen: string;
    created_at: Date;
    updated_at: Date;
}

interface Event {
    id: string;
    date: string;
    time: string;
    title: string;
    link: string;
    description: string;
    created_at: Date;
    updated_at: Date;
}

interface ActivityItem {
    id: string;
    type: "class" | "post" | "event";
    title: string;
    description: string;
    date: Date;
    time?: string;
    link?: string;
}

interface Logs {
    id: string;
    user_email: string;
    action: string;
    created_at: Date;
    updated_at: Date;
}

export default function Dashboard({ user_name, userEmail, plan, access_level }: DashboardProps) {
    const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const [classes, setClasses] = useState<Classes[]>([]);
    const [watchedVideos, setWatchedVideos] = useState<WhatchedVideoByUser[]>([]);
    const [posts, setPosts] = useState<Posts[]>([]);
    const [postsSeen, setPostsSeen] = useState<WhatchedPostByUser[]>([]);
    const [events, setEvents] = useState<Event[]>([]);

    const [logs, setLogs] = useState<Logs[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const [loading, setLoading] = useState(true);
    const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);

    useEffect(() => {
        if (access_level === 'admin') {
            const fetchLogs = async () => {
                try {
                    setLogsLoading(true);
                    const logsData = await getLogs();
                    setLogs(logsData);
                } catch (error) {
                    toast.error('Error fetching logs');
                } finally {
                    setLogsLoading(false);
                }
            };

            fetchLogs();
        }
    }, [access_level]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const classes = await getClasses();
                const watchedVideos = await getWatchedVideosByUser(userEmail);
                const posts = await getPosts();
                const postsSeen = await getpostsSeenByUser(userEmail);

                setClasses(classes);
                setWatchedVideos(watchedVideos);
                setPosts(posts);
                setPostsSeen(postsSeen);
            } catch (error) {
                toast.error("Error fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userEmail]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [fetchedClasses, fetchedPosts, fetchedEvents] = await Promise.all([
                    getClasses(),
                    getPosts(),
                    getEvents()
                ]);

                // Prepare activity data
                const classItems: ActivityItem[] = fetchedClasses.map((item) => ({
                    id: item.id,
                    type: "class" as const, // Explicitly set the type
                    title: item.title,
                    description: item.description,
                    date: new Date(item.created_at),
                }));

                const postItems: ActivityItem[] = fetchedPosts.map((item) => ({
                    id: item.id,
                    type: "post" as const, // Explicitly set the type
                    title: item.title,
                    description: item.description,
                    date: new Date(item.created_at),
                }));

                const eventItems: ActivityItem[] = fetchedEvents.map((item) => ({
                    id: item.id,
                    type: "event" as const, // Explicitly set the type
                    title: item.title,
                    description: item.description,
                    date: new Date(item.created_at),
                    time: item.time,
                    link: item.link,
                }));

                const allItems = [...classItems, ...postItems, ...eventItems].sort((a, b) => b.date.getTime() - a.date.getTime());
                setActivityItems(allItems);
            } catch (error) {
                toast.error("Error fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userEmail]);

    const watchedVideoCount = watchedVideos.filter((video) => video.watched === "true").length;
    const postsSeenCount = postsSeen.filter((post) => post.seen === "true").length;

    const videoProgress = classes.length ? (watchedVideoCount / classes.length) * 100 : 0;
    const postProgress = posts.length ? (postsSeenCount / posts.length) * 100 : 0;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Hello, {user_name}</h1>
            <div className="flex justify-between items-start mb-6">
                {/* Video Section */}
                <div className="w-2/3">
                    <ReactPlayer
                        url={`${BASE_URL}/storage/v1/object/public/default/video.mp4`}
                        controls
                        width="100%"
                        height="340px"
                        className="rounded-lg shadow-lg"
                    />
                </div>

                {/* Progress Bars */}
                <div className="w-1/3 pl-6">
                    <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
                    <div className="mb-4">
                        <p className="text-sm mb-1">Classes Progress</p>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-blue-500 h-4 rounded-full"
                                style={{ width: `${videoProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm mt-1">{Math.round(videoProgress)}%</p>
                    </div>
                    <div>
                        <p className="text-sm mb-1">Posts Progress</p>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-green-500 h-4 rounded-full"
                                style={{ width: `${postProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm mt-1">{Math.round(postProgress)}%</p>
                    </div>
                </div>
            </div>

            {/* Logs Section for Admin */}
            {access_level === 'admin' && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4 text-center">Logs</h2>
                    {logsLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <p className="text-gray-500">Loading logs...</p>
                        </div>
                    ) : (
                        <div className="h-80 overflow-y-auto bg-gray-50 p-4 rounded-lg shadow-inner space-y-2">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="p-3 rounded-md shadow-sm border-l-4 bg-gray-100 border-gray-400"
                                >
                                    <p className="text-sm font-semibold text-gray-800">
                                        User: {log.user_email}
                                    </p>
                                    <p className="text-xs text-gray-600">{log.action}</p>
                                    <p className="text-xs text-gray-500">
                                        Logged on: {new Date(log.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Updates Section */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-center">Updates</h2>
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-gray-500">Loading updates...</p>
                    </div>
                ) : (
                    <div className="activity-list h-80 overflow-y-auto space-y-3 bg-gray-50 p-4 rounded-lg shadow-inner">
                        {activityItems.map((item, index) => (
                            <div
                                key={item.id}
                                className={`p-3 rounded-md shadow-sm border-l-4 ${item.type === "class"
                                    ? "bg-blue-50 border-blue-500"
                                    : item.type === "post"
                                        ? "bg-green-50 border-green-500"
                                        : "bg-purple-50 border-purple-500"
                                    }`}
                            >
                                <h3 className="font-semibold text-sm">
                                    {item.type === "class"
                                        ? "New Class"
                                        : item.type === "post"
                                            ? "New Post"
                                            : "New Event"}
                                </h3>
                                <p className="text-xs text-gray-700">{item.title}</p>
                                <p className="text-xs text-gray-600">
                                    {item.date.toLocaleDateString()} {item.time && `at ${item.time}`}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
