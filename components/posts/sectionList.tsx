import { Button } from "@nextui-org/react";
import { CircleMinus, CirclePlus, Pencil, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import ReactPlayer from "react-player";

interface Section {
    id: string;
    parent_id: string | null;
    order: number;
    title: string;
    description: string;
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

interface SectionWithChildren extends Section {
    children: SectionWithChildren[];
    posts: Posts[];
}
interface WhatchedPostByUser {
    id: string;
    user_email: string;
    post_id: string;
    seen: string;
    created_at: Date;
    updated_at: Date;
}

interface SectionListProps {
    sections: Section[];
    onDelete: (id: string) => void;
    isAdmin: boolean;
    openEditOrAddModal: (parent_id: string | null, id: string | null, section: Section | null) => void;
    posts: Posts[];
    BASE_URL: string;
    access_level: "user" | "admin";
    handleEditPost: (cls: Posts) => void;
    handleDeletePost: (cls: Posts) => void;
    seenPosts: WhatchedPostByUser[];
    onWatchedPost: (post_id: string) => void;
}

const SectionList: React.FC<SectionListProps> = ({ sections,
    onDelete,
    isAdmin,
    openEditOrAddModal,
    posts,
    BASE_URL,
    access_level,
    handleEditPost,
    handleDeletePost,
    seenPosts,
    onWatchedPost
}) => {

    const allPosts = posts.map((cls) => ({
        id: cls.post_id,
        title: cls.title,
    }));

    const watchedVideoIds = seenPosts
        .filter((video) => video.seen === "true")
        .map((video) => video.post_id);

    const buildSectionHierarchy = (sections: Section[]): SectionWithChildren[] => {
        const sectionMap = new Map<string, SectionWithChildren>();

        sections.forEach((section) =>
            sectionMap.set(section.id, { ...section, children: [], posts: [] })
        );

        const orderedSections = sections.sort((a, b) => a.order - b.order);

        orderedSections.forEach((section) => {
            if (section.parent_id) {
                const parent = sectionMap.get(section.parent_id);
                if (parent) {
                    parent.children.push(sectionMap.get(section.id)!);
                }
            }
        });

        sectionMap.forEach((section) => {
            section.children.sort((a, b) => a.order - b.order);
        });

        return Array.from(sectionMap.values()).filter(
            (section) => !section.parent_id || section.parent_id === "0"
        );
    };

    const sectionHierarchy = buildSectionHierarchy(sections);

    return (
        <div className="accordion space-y-4">
            {sectionHierarchy.map((section) => {
                const sectionposts = posts.filter(
                    (cls) =>
                        cls.section_id === section.id ||
                        section.children.some((child) => child.id === cls.section_id)
                );

                const seenCount = sectionposts.filter((cls) =>
                    seenPosts.some((post) => post.post_id === cls.post_id && post.seen === "true")
                ).length;

                return (
                    <SectionItem
                        key={section.id}
                        section={section}
                        onDelete={onDelete}
                        isAdmin={isAdmin}
                        openEditOrAddModal={openEditOrAddModal}
                        posts={sectionposts}
                        BASE_URL={BASE_URL}
                        handleEditPost={handleEditPost}
                        handleDeletePost={handleDeletePost}
                        seenPosts={seenPosts}
                        onWatchedPost={onWatchedPost}
                        seenCount={seenCount}
                        totalPosts={sectionposts.length}
                    />
                );
            })}
            {access_level === "admin" && (
                <Button
                    isIconOnly
                    aria-label="Add Section"
                    color="danger"
                    onPress={() => openEditOrAddModal(null, null, null)}
                >
                    <CirclePlus />
                </Button>
            )}
        </div>
    );
};


function SectionItem({
    section,
    onDelete,
    isAdmin,
    openEditOrAddModal,
    posts,
    BASE_URL,
    handleEditPost,
    handleDeletePost,
    seenPosts,
    onWatchedPost,
    seenCount,
    totalPosts,
}: {
    readonly section: SectionWithChildren;
    readonly onDelete: (id: string) => void;
    readonly isAdmin: boolean;
    readonly openEditOrAddModal: (parent_id: string | null, id: string | null, section: Section | null) => void;
    readonly posts: Posts[];
    readonly BASE_URL: string;
    readonly handleEditPost: (cls: Posts) => void;
    readonly handleDeletePost: (cls: Posts) => void;
    readonly seenPosts: WhatchedPostByUser[];
    readonly onWatchedPost: (post_id: string) => void;
    readonly seenCount: number;
    readonly totalPosts: number;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const progressPercentage = Math.round((seenCount / totalPosts) * 100);


    return (
        <div className="border rounded-md bg-gray-100">
            <div
                className="flex justify-between items-center p-4 bg-grey-100 cursor-pointer"
                onClick={toggleExpand}
            >
                <div
                    className="flex justify-between items-center p-4 bg-grey-100 cursor-pointer w-full"
                >
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">{section.title}</h3>
                        <p className="text-sm text-gray-600">
                            {seenCount} of {totalPosts} posts seen
                        </p>
                    </div>
                    <div className="flex items-center ">
                        <div className="relative w-48 h-4 bg-gray-300 rounded-full overflow-hidden mr-4">

                            <div
                                className="absolute top-0 left-0 h-full bg-green-500"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                            {progressPercentage}%
                        </span>
                    </div>

                </div>
                <span>
                    {isExpanded ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5 text-blue-500"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18 12H6"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5 text-blue-500"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 12h12m-6-6v12"
                            />
                        </svg>
                    )}
                </span>
            </div>
            {isExpanded && (
                <div className="p-4 ">
                    <p className="text-gray-600">{section.description}</p>
                    <p className="text-sm text-gray-400 mt-2">
                        Created: {new Date(section.created_at).toLocaleDateString()}
                    </p>
                    {isAdmin && (
                        <div className="flex mt-4 space-x-2">
                            <Button
                                isIconOnly
                                aria-label="Like"
                                color="danger"
                                onPress={() => {
                                    openEditOrAddModal(section.id, null, null);
                                }}
                            >
                                <CirclePlus />
                            </Button>
                            <Button
                                isIconOnly
                                aria-label="Like"
                                color="danger"
                                onPress={() => {
                                    onDelete(section.id);
                                }}
                            >
                                <CircleMinus />
                            </Button>
                            <Button
                                isIconOnly
                                aria-label="Like"
                                color="danger"
                                onPress={() => {
                                    openEditOrAddModal(section.parent_id, section.id, section);
                                }}
                            >
                                <Pencil />
                            </Button>
                        </div>
                    )}
                    {/* Render posts */}
                    <div className="mt-6  ">
                        <ul className="space-y-6">
                            {posts.map((cls) => (
                                cls.section_id === section.id && (
                                    <div
                                        key={cls.id}
                                        className="p-6 border rounded-lg  backdrop-blur-xl bg-white"
                                    >
                                        {/* Post shower */}
                                        <div className="h-96 mb-6 border rounded-lg overflow-hidden">
                                            <iframe
                                                src={`${BASE_URL}/storage/v1/object/public/posts/${cls.section_id}/${cls.post_id}.pdf`}
                                                width="100%"
                                                height="100%"
                                                className="rounded-lg"
                                                title={`PDF Viewer - ${cls.title}`}
                                            ></iframe>
                                        </div>


                                        {/* Title and Description */}
                                        <li>
                                            <h5 className="text-4xl font-mono text-gray-900 mb-8">
                                                {cls.title}
                                            </h5>
                                            <p className="text-lg text-gray-600">
                                                {cls.description}
                                            </p>
                                        </li>

                                        <div className="flex items-center mt-4">

                                            <button
                                                onClick={() => onWatchedPost(cls.post_id)}
                                                className={`px-4 py-2 text-sm font-semibold rounded-md ${seenPosts.find((post) => post.post_id === cls.post_id && post.seen === "true")
                                                    ? "bg-green-500 text-white hover:bg-green-600"
                                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                    } transition-colors`}
                                            >
                                                {seenPosts.find((post) => post.post_id === cls.post_id && post.seen === "true") ? (
                                                    <>
                                                        <Eye className="w-5 h-5" /> {/* Ícone de olho preenchido */}
                                                        Seen
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="w-5 h-5" /> {/* Ícone de olho cortado */}
                                                        Mark as Seen
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        {/* Edit and Delete Buttons for Posts */}
                                        {isAdmin && (
                                            <div className="flex mt-4 space-x-2">
                                                <Button
                                                    isIconOnly
                                                    aria-label="Edit Post"
                                                    color="warning"
                                                    onPress={() => handleEditPost(cls)}
                                                >
                                                    <Pencil />
                                                </Button>
                                                <Button
                                                    isIconOnly
                                                    aria-label="Delete Post"
                                                    color="danger"
                                                    onPress={() => handleDeletePost(cls)}
                                                >
                                                    <CircleMinus />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )
                            ))}
                        </ul>
                    </div>
                    {/* Render Child Sections */}
                    {section.children.length > 0 && (
                        <div className="pl-4 mt-4">
                            {section.children.map((childSection) => (
                                <SectionItem
                                    key={childSection.id}
                                    section={childSection}
                                    onDelete={onDelete}
                                    isAdmin={isAdmin}
                                    openEditOrAddModal={openEditOrAddModal}
                                    posts={posts.filter((cls) => cls.section_id === section.id || section.children.some(child => child.id === cls.section_id))}
                                    BASE_URL={BASE_URL}
                                    handleEditPost={handleEditPost}
                                    handleDeletePost={handleDeletePost}
                                    onWatchedPost={onWatchedPost}
                                    seenPosts={seenPosts}
                                    seenCount={seenCount}
                                    totalPosts={totalPosts}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


export default SectionList;
