'use client';

import React, { useState, useEffect } from "react";
import {
    getSections, insertSection, updateSection, deleteSection, videoUploadorEdit, deleteVideo,
    getClasses,
    getWatchedVideosByUser,
    insertWatchedVideo,
    updateWatchedVideo,
} from "./actions";
import { useDisclosure } from "@nextui-org/modal";

import AddModalSectionForm from "@/components/classes/addModalSectionForm";
import { toast } from "react-toastify";
import ConfirmDeletionSectionForm from "@/components/classes/confirmDeletionModalSection";
import UploadFileForm from "@/components/classes/uploadFileForm";
import SectionList from "@/components/classes/sectionList";
import { Button } from "@nextui-org/react";
import { CirclePlus } from "lucide-react";
import { get } from "http";

interface ClassesProps {
    readonly userEmail: string;
    readonly plan: string;
    readonly access_level: "user" | "admin";
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


export default function Classes({ userEmail, plan, access_level }: ClassesProps) {
    const [sections, setSections] = useState<Section[]>([]);
    const [classes, setClasses] = useState<Classes[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteVideoModalVisible, setDeleteVideoModalVisible] = useState(false);

    const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
    const [videoToDelete, setVideoToDelete] = useState<Classes | null>(null);

    const [parent_id, setParentId] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);

    const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null);
    const [videoToEdit, setVideoToEdit] = useState<Classes | null>(null);

    const [loadingAddVideo, setLoadingAddVideo] = useState<boolean>(false);

    const [watchedVideos, setWatchedVideos] = useState<WhatchedVideoByUser[]>([]);

    const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;



    // Fetch sections on component mount
    useEffect(() => {
        const fetchSectionsAndClasses = async () => {
            setLoading(true);
            try {
                const fetchedSections = await getSections();
                setSections(fetchedSections);
                const fetchedClasses = await getClasses();
                setClasses(fetchedClasses);
                const fetchedWatchedVideos = await getWatchedVideosByUser(userEmail);
                setWatchedVideos(fetchedWatchedVideos);
            } catch (error) {
                console.error("Error fetching sections:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSectionsAndClasses();
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

    const openDeleteVideoModal = (video: Classes) => {
        setVideoToDelete(video);
        setDeleteVideoModalVisible(true);
    };

    const handleWatchedVideo = async (videoId: string) => {
        try {
            const formData = new FormData();
            const video = watchedVideos.find((video) => video.video_id === videoId);
            formData.append("video_id", videoId);
            formData.append("user_email", userEmail);
            formData.append("watched", (video != undefined && video.watched == "true") ? "false" : "true");
            formData.append("id", video?.id ?? "");

            if (!video) {
                await insertWatchedVideo(formData);
                const new_watched_videos = await getWatchedVideosByUser(userEmail);
                setWatchedVideos(new_watched_videos);
            } else {
                await updateWatchedVideo(formData);
                const new_watched_videos = await getWatchedVideosByUser(userEmail);
                setWatchedVideos(new_watched_videos);
            }
        } catch (error) {
            toast.error("Error updating watched video status.");
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



    const confirmDeleteVideo = async () => {

        if (!videoToDelete) return;

        try {

            await deleteVideo(videoToDelete.video_id, videoToDelete.id, videoToDelete.section_id);

            const updatedClasses = await getClasses();
            setClasses(updatedClasses);
        } catch (error) {
            toast.error("Error deleting section");
            console.error("Error deleting section:", error);
        } finally {
            setDeleteModalVisible(false);
            setSectionToDelete(null);
        }
    };

    const editVideo = async (classes: Classes) => {
        setVideoToEdit(classes);
        if (typeof window !== 'undefined') {
            window.scrollTo(
                {
                    top: 0,
                    behavior: "smooth"
                }
            );
        }
    };

    return (
        <div className="max-w-full mx-auto p-6 font-sans space-y-8">
            {/* Header */}
            <header className="bg-blue-100 p-4 rounded-md shadow-md">
                <h1 className="text-3xl font-bold text-gray-800">Classes</h1>
                <p className="text-lg text-gray-600 mt-2">Acess: {userEmail}</p>
                <p className="text-lg text-gray-600">Plan: {plan}</p>
                <p className="text-lg text-gray-600">Access Level: {access_level}</p>
            </header>
            {(access_level === "admin" && !loading) && <UploadFileForm videoUpload={videoUploadorEdit} sectionOptions={sections} setLoadingAddVideo={setLoadingAddVideo} loadingAddVideo={loadingAddVideo}
                videoToEdit={videoToEdit}
                defaultFile={videoToEdit ? { url: `${BASE_URL}/storage/v1/object/public/classes/${videoToEdit.section_id}/${videoToEdit.video_id}.mp4`, name: "default-video.mp4" } : undefined}
            />}

            {/* Section Management */}
            <main >
                {loading ? (
                    <p className="text-gray-500">Loading your classes...</p>
                ) : sections.length > 0 ? (
                    <SectionList
                        sections={sections}
                        classes={classes}
                        onDelete={openDeleteModal}
                        isAdmin={access_level === "admin"}
                        openEditOrAddModal={openEditOrAddModal}
                        BASE_URL={BASE_URL ?? ''}
                        access_level={access_level}
                        handleDeletePost={openDeleteVideoModal}
                        handleEditPost={editVideo}
                        watchedVideos={watchedVideos}
                        onWatchedVideo={handleWatchedVideo}
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

                {access_level === "admin" && <ConfirmDeletionSectionForm title="Are you sure you whant to delete this video?" onSubmit={confirmDeleteVideo} isOpen={deleteVideoModalVisible} onOpenChange={() => {
                    setDeleteVideoModalVisible(!deleteVideoModalVisible);
                    setVideoToDelete(null);
                }} />}
            </main>
        </div>
    );
}
