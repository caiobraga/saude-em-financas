"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "./markdown-styles.css";
import { CirclePlus } from "lucide-react";
import { toast } from "react-toastify";
import {
    insertForumTable,
    updateForumTable,
    deleteForumTable,
    getForumTable,
    insertForumPosts,
    updateForumPosts,
    deleteForumPosts,
    getForumPosts,
} from "./actions";

interface ForumProps {
    readonly userEmail: string;
    readonly plan: string;
    readonly access_level: "user" | "admin";
}

interface ForumTable {
    id: string;
    order: number;
    title: string;
    description: string;
    created_at: Date;
    updated_at: Date;
}

interface ForumPost {
    id: string;
    parent_id: string | null;
    table_id: string;
    user_email: string;
    user_name: string;
    title: string;
    likes: number;
    likedBy: string[]; // Stores emails of users who liked the post
    description: string;
    order: number;
    created_at: Date;
    updated_at: Date;
}

export default function Forum({ userEmail, plan, access_level }: ForumProps) {
    const [tables, setTables] = useState<ForumTable[]>([]);
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [newTableTitle, setNewTableTitle] = useState("");
    const [newTableDescription, setNewTableDescription] = useState("");
    const [markdown, setMarkdown] = useState("");
    const [activeEditor, setActiveEditor] = useState<{ type: "post" | "comment" | "edit"; id: string | null } | null>(null);
    const [postTitle, setPostTitle] = useState("");
    const [editingTable, setEditingTable] = useState<ForumTable | null>(null);


    useEffect(() => {
        fetchTables();
        fetchPosts();
    }, []);

    const fetchTables = async () => {
        try {
            const data = await getForumTable();
            setTables(data);
        } catch (error) {
            toast.error("Failed to fetch tables.");
        }
    };

    const fetchPosts = async () => {
        try {
            const data = await getForumPosts();
            setPosts(data);
        } catch (error) {
            toast.error("Failed to fetch posts.");
        }
    };

    const handleDeleteTable = async (tableId: string) => {
        if (confirm("Are you sure you want to delete this table? This action cannot be undone.")) {
            try {
                const formData = new FormData();
                formData.append("id", tableId);
                await deleteForumTable({ message: "" }, formData);
                fetchTables(); // Refresh the table list
                toast.success("Table deleted successfully.");
            } catch (error) {
                toast.error("Failed to delete table.");
            }
        }
    };


    const submitPost = async (title: string, tableId: string, parentId: string | null) => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", markdown);
        formData.append("table_id", tableId);
        formData.append("user_email", userEmail);
        formData.append("user_name", userEmail.split("@")[0]);
        try {
            await insertForumPosts(parentId, formData);
            fetchPosts();
            setMarkdown("");
            setActiveEditor(null);
            toast.success("Post submitted successfully.");
        } catch (error) {
            toast.error("Failed to submit post.");
        }
    };

    const editPost = (postId: string) => {
        const post = posts.find((p) => p.id === postId);
        if (post && post.user_email === userEmail) {
            setMarkdown(post.description);
            setPostTitle(post.title);
            setActiveEditor({ type: "edit", id: postId });
        } else {
            toast.warn("You can only edit your own posts.");
        }
    };

    const saveEditedPost = async (post: ForumPost) => {
        const formData = new FormData();

        formData.append("id", post.id);
        formData.append("likes", String(post.likes + 1));
        formData.append("liked_by", [...post.likedBy, userEmail].join(","));
        formData.append("user_email", post.user_email);
        formData.append("user_name", post.user_name);
        formData.append("table_id", post.table_id);
        formData.append("order", String(post.order));
        formData.append("created_at", post.created_at.toISOString());
        formData.append("updated_at", new Date().toISOString());


        formData.append("title", postTitle);
        formData.append("description", markdown);
        try {
            await updateForumPosts(null, formData);
            fetchPosts();
            setMarkdown("");
            setPostTitle("");
            setActiveEditor(null);
            toast.success("Post updated successfully.");
        } catch (error) {
            toast.error("Failed to update post.");
        }
    };

    const deletePost = async (postId: string) => {
        const formData = new FormData();
        formData.append("id", postId);
        try {
            await deleteForumPosts({ message: "" }, formData);
            fetchPosts();
            toast.success("Post deleted successfully.");
        } catch (error) {
            toast.error("Failed to delete post.");
        }
    };

    const resetForm = () => {
        setNewTableTitle("");
        setNewTableDescription("");
        setEditingTable(null);
    };

    const addOrUpdateTable = async () => {
        const formData = new FormData();
        formData.append("title", newTableTitle);
        formData.append("description", newTableDescription);

        try {
            if (editingTable) {
                // Update existing table
                formData.append("id", editingTable.id);
                await updateForumTable(null, formData);
                toast.success("Table updated successfully.");
            } else {
                // Add new table
                await insertForumTable(null, formData);
                toast.success("Table added successfully.");
            }
            fetchTables();
            resetForm();
        } catch (error) {
            toast.error(editingTable ? "Failed to update table." : "Failed to add table.");
        }
    };


    const deleteTable = async (tableId: string) => {
        const formData = new FormData();
        formData.append("id", tableId);
        try {
            await deleteForumTable({ message: "" }, formData);
            fetchTables();
            toast.success("Table deleted successfully.");
        } catch (error) {
            toast.error("Failed to delete table.");
        }
    };

    const likePost = async (postId: string) => {
        const post = posts.find((p) => p.id === postId);
        if (post && !post.likedBy.includes(userEmail)) {
            const formData = new FormData();
            formData.append("id", postId);
            formData.append("likes", String(post.likes + 1));
            formData.append("liked_by", [...post.likedBy, userEmail].join(","));
            formData.append("title", post.title);
            formData.append("description", post.description);
            formData.append("user_email", post.user_email);
            formData.append("user_name", post.user_name);
            formData.append("table_id", post.table_id);
            formData.append("order", String(post.order));
            formData.append("created_at", post.created_at.toISOString());
            formData.append("updated_at", new Date().toISOString());
            try {
                await updateForumPosts(null, formData);
                fetchPosts();
                toast.success("Post liked.");
            } catch (error) {
                toast.error("Failed to like post.");
            }
        } else {
            toast.info("You have already liked this post.");
        }
    };



    const handleEditorChange = ({ text }: { text: string }) => {
        setMarkdown(text);
    };

    const renderPosts = (parentId: string | null, tableId: string) => {
        return posts
            .filter((post) => post.parent_id === parentId && post.table_id === tableId).sort((a, b) => a.created_at > b.created_at ? -1 : 1)
            .map((post) => (
                <div
                    key={post.id}
                    className={`mt-4 p-4 border rounded-lg ${parentId ? "ml-8" : "ml-0"} shadow-md bg-white`}
                >
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <p className="text-sm text-gray-600">
                        <strong>By:</strong> {post.user_name} - {post.created_at.toLocaleString()}
                    </p>
                    <div className="prose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {post.description}
                        </ReactMarkdown>
                    </div>
                    <div className="mt-2 flex space-x-4">
                        <button
                            className="text-blue-500 hover:underline"
                            onClick={() => likePost(post.id)}
                        >
                            Like ({post.likes})
                        </button>
                        <button
                            className="text-blue-500 hover:underline"
                            onClick={() => setActiveEditor({ type: "comment", id: post.id })}
                        >
                            Reply
                        </button>
                        {post.user_email === userEmail && (
                            <>
                                <button
                                    className="text-blue-500 hover:underline"
                                    onClick={() => editPost(post.id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="text-red-500 hover:underline"
                                    onClick={() => deletePost(post.id)}
                                >
                                    Delete
                                </button>
                            </>
                        )}


                    </div>

                    {/* Render active editor below the current post */}
                    {activeEditor?.id === post.id && (
                        <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
                            <h4 className="text-md font-semibold mb-2">Reply or Edit Post</h4>
                            <MdEditor
                                value={markdown}
                                style={{ height: "200px" }}
                                renderHTML={(text) => (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                        {text}
                                    </ReactMarkdown>
                                )}
                                onChange={handleEditorChange}
                            />
                            <button
                                onClick={() =>
                                    activeEditor.type === "edit"
                                        ? saveEditedPost(post)
                                        : submitPost(postTitle, tableId, post.id)
                                }
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                {activeEditor.type === "edit" ? "Save Changes" : "Submit Reply"}
                            </button>
                        </div>
                    )}
                    {renderPosts(post.id, tableId)}
                </div>
            ));
    };

    return (
        <div className="container">
            <h1>Hello, {userEmail}</h1>
            {access_level === "admin" && (
                <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-4">
                    <h2 className="text-2xl font-semibold mb-4">{editingTable ? "Edit Table" : "Add a New Table"}</h2>
                    <input
                        type="text"
                        placeholder="Table Title"
                        value={newTableTitle}
                        onChange={(e) => setNewTableTitle(e.target.value)}
                        className="w-full p-2 mb-4 border rounded"
                    />
                    <textarea
                        placeholder="Table Description"
                        value={newTableDescription}
                        onChange={(e) => setNewTableDescription(e.target.value)}
                        rows={3}
                        className="w-full p-2 mb-4 border rounded"
                    />
                    <button
                        onClick={addOrUpdateTable}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        {editingTable ? "Save Changes" : "Add Table"}
                    </button>
                    {editingTable && (
                        <button
                            onClick={resetForm}
                            className="ml-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            )}

            <Tabs>
                <TabList>
                    {tables.map((table) => (
                        <Tab key={table.id}>
                            <div className="flex items-center justify-between">
                                <span>{table.title}</span>
                                {access_level === "admin" && (
                                    <div className="ml-4 flex space-x-2">
                                        {/* Edit Button */}
                                        <button
                                            onClick={() => {
                                                setNewTableTitle(table.title);
                                                setNewTableDescription(table.description);
                                                setEditingTable(table);
                                            }}
                                            className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Edit
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDeleteTable(table.id)}
                                            className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Tab>
                    ))}
                </TabList>

                {tables.map((table) => (
                    <TabPanel key={table.id}>
                        <div className="p-4 bg-gray-50 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-2">{table.title}</h2>
                            <p className="text-gray-700">{table.description}</p>
                            <button
                                onClick={() => setActiveEditor({ type: "post", id: table.id })}
                                className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium text-md rounded-full shadow-md hover:from-blue-600 hover:to-indigo-600 transition duration-200 transform hover:scale-105 active:scale-95"
                            >
                                <CirclePlus size={16} />
                                Add Post
                            </button>
                            {activeEditor && activeEditor.type === "post" && activeEditor.id === table.id && (
                                <div style={{ marginTop: "1rem" }}>
                                    <input
                                        type="text"
                                        placeholder="Post Title"
                                        value={postTitle}
                                        onChange={(e) => setPostTitle(e.target.value)}
                                        style={{ marginBottom: "0.5rem", display: "block", width: "100%", padding: "0.5rem" }}
                                    />
                                    <MdEditor
                                        value={markdown}
                                        style={{ height: "300px" }}
                                        renderHTML={(text) => (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                                {text}
                                            </ReactMarkdown>
                                        )}
                                        onChange={handleEditorChange}
                                    />
                                    <button
                                        onClick={() => submitPost(postTitle, table.id, null)}
                                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Submit Post
                                    </button>
                                </div>
                            )}
                            {renderPosts(null, table.id)}
                        </div>
                    </TabPanel>
                ))}
            </Tabs>
        </div>
    );
}
