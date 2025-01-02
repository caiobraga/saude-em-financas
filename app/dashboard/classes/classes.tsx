'use client';

import React, { useState, useEffect } from "react";
import {
    getSections, insertSection, updateSection, deleteSection, videoUpload, insertClass,
    getClasses,
    deleteClass,
    getVideosFromSectionId
} from "./actions";
import { Button, user } from "@nextui-org/react";
import { useDisclosure } from "@nextui-org/modal";

import { CircleMinus, CirclePlus, Pencil } from "lucide-react";
import AddModalSectionForm from "@/components/classes/addModalSectionForm";
import { toast } from "react-toastify";
import ConfirmDeletionSectionForm from "@/components/classes/confirmDeletionModalSection";
import UploadFileForm from "@/components/classes/uploadFileForm";
import ReactPlayer from 'react-player';

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

interface SectionWithChildren extends Section {
    children: SectionWithChildren[];
    classes: Classes[];
}



export default function Classes({ userEmail, plan, access_level }: ClassesProps) {
    const [sections, setSections] = useState<Section[]>([]);
    const [classes, setClasses] = useState<Classes[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);

    const [parent_id, setParentId] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);

    const [loadingAddVideo, setLoadingAddVideo] = useState<boolean>(false);

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
        <div className="max-w-6xl mx-auto p-6 font-sans space-y-8">
            {/* Header */}
            <header className="bg-blue-100 p-4 rounded-md shadow-md">
                <h1 className="text-3xl font-bold text-gray-800">Wellcome</h1>
                <p className="text-lg text-gray-600 mt-2">Acess: {userEmail}</p>
                <p className="text-lg text-gray-600">Plan: {plan}</p>
                <p className="text-lg text-gray-600">Access Level: {access_level}</p>
            </header>
            {(access_level === "admin" && !loading) && <UploadFileForm videoUpload={videoUpload} sectionOptions={sections} setLoadingAddVideo={setLoadingAddVideo} loadingAddVideo={loadingAddVideo} />}

            {/* Section Management */}
            <main className="bg-white p-4 rounded-md shadow-md space-y-6">
                <h2 className="text-2xl font-bold text-gray-700">Classes</h2>
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
                    />
                ) : (
                    <p className="text-gray-500">No sections available. Add a new section below.</p>
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

function SectionList({
    sections,
    onDelete,
    isAdmin,
    openEditOrAddModal,
    classes,
    BASE_URL,
    access_level
}: {
    sections: Section[];
    onDelete: (id: string) => void;
    isAdmin: boolean;
    openEditOrAddModal: (parent_id: string | null, id: string | null) => void;
    classes: Classes[];
    BASE_URL: string;
    access_level: "user" | "admin";
}) {
    // Helper function to build the section hierarchy
    const buildSectionHierarchy = (sections: Section[]): SectionWithChildren[] => {
        const sectionMap = new Map<string, SectionWithChildren>();

        // Initialize all sections in the map with empty children
        sections.forEach((section) =>
            sectionMap.set(section.id, { ...section, children: [], classes: [] })
        );

        const orderedSections = sections.sort((a, b) => a.order - b.order);

        // Populate children for parent sections
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

        // Filter out only root sections (no parent_id or "0")
        return Array.from(sectionMap.values()).filter(
            (section) => !section.parent_id || section.parent_id === "0"
        );
    };

    const sectionHierarchy = buildSectionHierarchy(sections);

    return (
        <div className="accordion space-y-4">
            {sectionHierarchy.map((section) => (
                <SectionItem
                    key={section.id}
                    section={section}
                    onDelete={onDelete}
                    isAdmin={isAdmin}
                    openEditOrAddModal={openEditOrAddModal}
                    classes={classes.filter((cls) => cls.section_id === section.id || section.children.some(child => child.id === cls.section_id))}
                    BASE_URL={BASE_URL}
                />
            ))}
            {
                access_level === "admin" &&
                <Button isIconOnly aria-label="Like" color="danger" onPress={() => {
                    openEditOrAddModal(null, null);
                }}>
                    <CirclePlus />
                </Button>}
        </div>
    );
}

function SectionItem({
    section,
    onDelete,
    isAdmin,
    openEditOrAddModal,
    classes,
    BASE_URL
}: {
    section: SectionWithChildren;
    onDelete: (id: string) => void;
    isAdmin: boolean;
    openEditOrAddModal: (parent_id: string | null, id: string | null) => void;
    classes: Classes[];
    BASE_URL: string;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <div className="border rounded-md shadow-sm">
            <div
                className="flex justify-between items-center p-4 bg-gray-100 cursor-pointer"
                onClick={toggleExpand}
            >
                <h3 className="text-lg font-bold text-gray-800">{section.title}</h3>
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
                <div className="p-4 bg-white">
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
                                    openEditOrAddModal(section.id, null);
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
                                    openEditOrAddModal(section.parent_id, section.id);
                                }}
                            >
                                <Pencil />
                            </Button>
                        </div>
                    )}
                    {/* Render Classes */}
                    {classes.length > 0 && (
                        <div className="mt-6">
                            <ul className="space-y-6">
                                {classes.map((cls) => (
                                    cls.section_id === section.id &&
                                    <div key={cls.id} className="p-4 border rounded-lg bg-white shadow-md">
                                        {/* Video Player */}
                                        <div className="aspect-w-16 aspect-h-9 mb-4">
                                            <ReactPlayer
                                                url={`${BASE_URL}/storage/v1/object/public/classes/${cls.section_id}/${cls.video_id}.mp4`}
                                                controls
                                                width="100%"
                                                height="100%"
                                                className="rounded-lg"
                                            />
                                        </div>

                                        {/* Title and Description */}
                                        <li>
                                            <h5 className="text-xl font-bold text-gray-900 mb-2">{cls.title}</h5>
                                            <p className="text-base text-gray-700">{cls.description}</p>
                                        </li>
                                    </div>
                                ))}
                            </ul>
                        </div>
                    )}
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
                                    classes={classes.filter((cls) => cls.section_id === section.id || section.children.some(child => child.id === cls.section_id))}
                                    BASE_URL={BASE_URL}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
