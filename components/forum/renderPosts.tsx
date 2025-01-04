import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import MdEditor from "react-markdown-editor-lite";


interface RenderPostsProps {
    parentId: string | null;
    tableId: string;
    posts: ForumPost[];
    userEmail: string;
    activeEditor: { type: "post" | "comment" | "edit"; id: string | null } | null;
    likePost: (id: string) => void;
    setActiveEditor: (editor: { type: "post" | "comment" | "edit"; id: string | null }) => void;
    editPost: (id: string) => void;
    deletePost: (id: string) => void;
    markdown: string;
    handleEditorChange: (data: { text: string; html: string }) => void;
    saveEditedPost: (post: ForumPost) => void;
    submitPost: (title: string, tableId: string, parentId: string) => void;
    postTitle: string;
    access_level: "user" | "admin";

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
    likedBy: string[];
    description: string;
    order: number;
    created_at: Date;
    updated_at: Date;
}

const RenderPosts: React.FC<RenderPostsProps> = ({
    parentId,
    tableId,
    posts, userEmail, activeEditor,
    likePost,
    setActiveEditor,
    editPost,
    deletePost,
    markdown,
    handleEditorChange,
    saveEditedPost,
    submitPost,
    postTitle,
    access_level
}) => {
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
                    {(post.user_email === userEmail || access_level == 'admin') && (
                        <>
                            {
                                post.user_email === userEmail && (
                                    <button
                                        className="text-blue-500 hover:underline"
                                        onClick={() => editPost(post.id)}
                                    >
                                        Edit
                                    </button>
                                )
                            }
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
                <RenderPosts {...{
                    parentId: post.id,
                    tableId,
                    posts,
                    userEmail,
                    activeEditor,
                    likePost,
                    setActiveEditor,
                    editPost,
                    deletePost,
                    markdown,
                    handleEditorChange,
                    saveEditedPost,
                    submitPost,
                    postTitle,
                    access_level
                }} />
            </div>
        ));
};

export default RenderPosts;
