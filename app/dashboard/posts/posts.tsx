"use client";

import { Button, useDisclosure } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { deleteSection, getClasses, getSections, insertSection, postUpload, updateSection } from "./actions";
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

export default function Posts({ userEmail, plan, access_level }: PostsProps) {
    const [sections, setSections] = useState<Section[]>([]);
    const [classes, setClasses] = useState<Posts[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);

    const [parent_id, setParentId] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);

    const [loadingAddpost, setLoadingAddpost] = useState<boolean>(false);

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
            } catch (error) {
                console.error("Error fetching sections:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSectionsAndClasses();
    }, []);

    const openEditOrAddModal = (new_parent_id: string | null, id: string | null) => {
        setParentId(new_parent_id);
        setId(id);
        onOpen();
    }

    const openDeleteModal = (sectionId: string) => {
        setSectionToDelete(sectionId);
        setDeleteModalVisible(true);
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

    return (
        <div className="max-w-full mx-auto p-6 font-sans space-y-8">
            {/* Header */}
            <header className="bg-blue-100 p-4 rounded-md shadow-md">
                <h1 className="text-3xl font-bold text-gray-800">Posts</h1>
                <p className="text-lg text-gray-600 mt-2">Acess: {userEmail}</p>
                <p className="text-lg text-gray-600">Plan: {plan}</p>
                <p className="text-lg text-gray-600">Access Level: {access_level}</p>
            </header>
            {(access_level === "admin" && !loading) && <UploadFileForm postUpload={postUpload} sectionOptions={sections} setLoadingAddpost={setLoadingAddpost} loadingAddpost={loadingAddpost} />}

            {/* Section Management */}
            <main >
                {loading ? (
                    <p className="text-gray-500">Loading Posts...</p>
                ) : sections.length > 0 ? (
                    <SectionList
                        sections={sections}
                        classes={classes}
                        onDelete={openDeleteModal}
                        isAdmin={access_level === "admin"}
                        openEditOrAddModal={openEditOrAddModal}
                        BASE_URL={BASE_URL ?? ''}
                        access_level={access_level}
                    />
                ) : (
                    <>
                        <p className="text-gray-500">No sections available. Add a new section below.</p>
                        {
                            access_level === "admin" &&
                            <Button isIconOnly aria-label="Like" color="danger" onPress={() => {
                                openEditOrAddModal(null, null);
                            }}>
                                <CirclePlus />
                            </Button>}
                    </>
                )}
                {access_level === "admin" && <AddModalSectionForm title="Add Or Edit Section" onSubmit={handleAddSection} isOpen={isOpen} onOpenChange={onOpenChange} />}

                {access_level === "admin" && <ConfirmDeletionSectionForm title="Are you sure you whant to delete this section?" onSubmit={confirmDelete} isOpen={deleteModalVisible} onOpenChange={() => {
                    setDeleteModalVisible(!deleteModalVisible);
                    setSectionToDelete(null);
                }} />}
            </main>
        </div>
    );
}
