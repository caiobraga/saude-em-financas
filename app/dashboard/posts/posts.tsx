"use client";

import { Button, useDisclosure } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { deleteSection, getPosts, getSections, insertSection, updateSection, getpostsSeenByUser, deleteposts, insertSeendposts, updateSeendposts, postsUploadorEdit } from "./actions";
import { toast } from "react-toastify";
import UploadFileForm from "@/components/posts/uploadFileForm";
import SectionList from "@/components/posts/sectionList";
import AddModalSectionForm from "@/components/posts/addModalSectionForm";
import ConfirmDeletionSectionForm from "@/components/confirmDeletionModalSection";
import { CirclePlus } from "lucide-react";

interface PostsProps {
    readonly userEmail: string;
    readonly plan: string;
    readonly access_level: 'user' | 'admin';
}

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
interface WhatchedPostByUser {
    id: string;
    user_email: string;
    post_id: string;
    seen: string;
    created_at: Date;
    updated_at: Date;
}

export default function Posts({ userEmail, plan, access_level }: PostsProps) {
    const [sections, setSections] = useState<Section[]>([]);
    const [posts, setPosts] = useState<Posts[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletepostModalVisible, setDeletePostModalVisible] = useState(false);

    const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
    const [postToDelete, setPostToDelete] = useState<Posts | null>(null);

    const [parent_id, setParentId] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);

    const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null);
    const [postToEdit, setPostToEdit] = useState<Posts | null>(null);

    const [loadingAddPost, setLoadingAddPost] = useState<boolean>(false);

    const [seenPosts, setseenPosts] = useState<WhatchedPostByUser[]>([]);

    const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;



    // Fetch sections on component mount
    useEffect(() => {
        const fetchSectionsAndposts = async () => {
            setLoading(true);
            try {
                const fetchedSections = await getSections();
                setSections(fetchedSections);
                const fetchedposts = await getPosts();
                setPosts(fetchedposts);
                const fetchedseenPosts = await getpostsSeenByUser(userEmail);
                setseenPosts(fetchedseenPosts);
            } catch (error) {
                console.error("Error fetching sections:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSectionsAndposts();
    }, []);

    const openEditOrAddModal = (new_parent_id: string | null, id: string | null, section: Section | null) => {
        setParentId(new_parent_id);
        setId(id);
        setSectionToEdit(section);
        onOpen();
    }

    const openDeleteModal = (sectionId: string) => {
        setSectionToDelete(sectionId);
        setDeleteModalVisible(true);
    };

    const openDeletePostModal = (post: Posts) => {
        setPostToDelete(post);
        setDeletePostModalVisible(true);
    };

    const handleWatchedPost = async (post_id: string) => {
        try {
            const formData = new FormData();
            const post = seenPosts.find((post) => post.post_id === post_id);
            const aula = posts.find((posts) => posts.post_id === post_id);
            const section = sections.find((section) => section.id === aula?.section_id);
            formData.append("post_id", post_id);
            formData.append("user_email", userEmail);
            formData.append("seen", (post != undefined && post.seen == "true") ? "false" : "true");
            formData.append("class_name", section?.title ?? "");
            formData.append("post_name", aula?.title ?? "");
            formData.append("id", post?.id ?? "");

            if (!post) {
                await insertSeendposts(formData);
                const new_watched_posts = await getpostsSeenByUser(userEmail);
                setseenPosts(new_watched_posts);
            } else {
                await updateSeendposts(formData);
                const new_watched_posts = await getpostsSeenByUser(userEmail);
                setseenPosts(new_watched_posts);
            }
        } catch (error) {
            toast.error("Error updating watched post status.");
            console.error("Error:", error);
        }
    };


    const handleAddSection = async (formData: FormData) => {
        onOpenChange();
        try {
            if (id) {
                formData.set("id", id);

                const result = await updateSection(parent_id, formData);
                if (result?.message) {
                    toast.error(`Error: ${result.message}`);
                } else {
                    const updatedSections = await getSections();
                    setSections(updatedSections);
                }
            } else {
                const result = await insertSection(parent_id, formData);
                if (result?.message) {
                    toast.error(`Error: ${result.message}`);
                } else {
                    // Refresh sections
                    const updatedSections = await getSections();
                    setSections(updatedSections);
                }
            }

        } catch (error) {
            toast.error("Error adding section");
            console.error("Error adding section:", error);
        } finally {
            setParentId(null);
            setId(null);
        }
    };

    const confirmDelete = async () => {
        if (!sectionToDelete) return;

        try {
            const formData = new FormData();
            formData.set("id", sectionToDelete);

            const result = await deleteSection({ message: "" }, formData);
            if (result?.message) {
                toast.error(`Error: ${result.message}`);
            } else {
                const updatedSections = await getSections();
                setSections(updatedSections);
            }
        } catch (error) {
            toast.error("Error deleting section");
            console.error("Error deleting section:", error);
        } finally {
            setDeleteModalVisible(false);
            setSectionToDelete(null);
        }
    };



    const confirmDeletepost = async () => {

        if (!postToDelete) return;

        try {

            await deleteposts(postToDelete.post_id, postToDelete.id, postToDelete.section_id);

            const updatedposts = await getPosts();
            setPosts(updatedposts);
        } catch (error) {
            toast.error("Error deleting section");
            console.error("Error deleting section:", error);
        } finally {
            setDeleteModalVisible(false);
            setSectionToDelete(null);
        }
    };

    const editPost = async (posts: Posts) => {
        setPostToEdit(posts);
        if (typeof window !== 'undefined') {
            window.scrollTo(
                {
                    top: 0,
                    behavior: "smooth"
                }
            );
        }
    };

    const postuploadEdit = async (formData: FormData) => {
        setLoadingAddPost(true);
        try {
            const result = await postsUploadorEdit(formData);
            if (result?.message) {
                toast.error(`Error: ${result.message}`);
            } else {
                const updatedposts = await getPosts();
                setPosts(updatedposts);
            }
        } catch (error) {
            toast.error("Error adding section");
            console.error("Error adding section:", error);
        } finally {
            setPostToEdit(null);
            setLoadingAddPost(false);
        }
    }

    return (
        <div className="max-w-full mx-auto p-6 font-sans space-y-8">
            {/* Header */}
            <header className="bg-blue-100 p-4 rounded-md shadow-md">
                <h1 className="text-3xl font-bold text-gray-800">Posts</h1>
                <p className="text-lg text-gray-600 mt-2">Acess: {userEmail}</p>
                <p className="text-lg text-gray-600">Plan: {plan}</p>
                <p className="text-lg text-gray-600">Access Level: {access_level}</p>
            </header>
            {(access_level === "admin" && !loading) && <UploadFileForm postUpload={postuploadEdit} sectionOptions={sections} setLoadingAddpost={setLoadingAddPost} loadingAddpost={loadingAddPost}
                postToEdit={postToEdit}
                defaultFile={postToEdit ? { url: `${BASE_URL}/storage/v1/object/public/posts/${postToEdit.section_id}/${postToEdit.post_id}.mp4`, name: "default-post.mp4" } : undefined}
            />}

            {/* Section Management */}
            <main >
                {loading ? (
                    <p className="text-gray-500">Loading your posts...</p>
                ) : sections.length > 0 ? (
                    <SectionList
                        sections={sections}
                        posts={posts}
                        onDelete={openDeleteModal}
                        isAdmin={access_level === "admin"}
                        openEditOrAddModal={openEditOrAddModal}
                        BASE_URL={BASE_URL ?? ''}
                        access_level={access_level}
                        handleDeletePost={openDeletePostModal}
                        handleEditPost={editPost}
                        seenPosts={seenPosts}
                        onWatchedPost={handleWatchedPost}
                    />
                ) : (
                    <>
                        <p className="text-gray-500">No sections available. Add a new section below.</p>
                        {
                            access_level === "admin" &&
                            <Button isIconOnly aria-label="Like" color="danger" onPress={() => {
                                openEditOrAddModal(null, null, null);
                            }}>
                                <CirclePlus />
                            </Button>}
                    </>

                )}

                {access_level === "admin" && <AddModalSectionForm title="Add Or Edit Section" onSubmit={handleAddSection} isOpen={isOpen} onOpenChange={onOpenChange} sectionToEdit={sectionToEdit} />}

                {access_level === "admin" && <ConfirmDeletionSectionForm title="Are you sure you whant to delete this section?" onSubmit={confirmDelete} isOpen={deleteModalVisible} onOpenChange={() => {
                    setDeleteModalVisible(!deleteModalVisible);
                    setSectionToDelete(null);
                }} />}

                {access_level === "admin" && <ConfirmDeletionSectionForm title="Are you sure you whant to delete this post?" onSubmit={confirmDeletepost} isOpen={deletepostModalVisible} onOpenChange={() => {
                    setDeletePostModalVisible(!deletepostModalVisible);
                    setPostToDelete(null);
                }} />}
            </main>
        </div>
    );
}
