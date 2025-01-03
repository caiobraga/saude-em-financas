import { Button } from "@nextui-org/react";
import { CircleMinus, CirclePlus, Pencil } from "lucide-react";
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


interface SectionListProps {
    sections: Section[];
    onDelete: (id: string) => void;
    isAdmin: boolean;
    openEditOrAddModal: (parent_id: string | null, id: string | null) => void;
    classes: Classes[];
    BASE_URL: string;
    access_level: "user" | "admin";
}

const SectionList: React.FC<SectionListProps> = ({ sections,
    onDelete,
    isAdmin,
    openEditOrAddModal,
    classes,
    BASE_URL,
    access_level }) => {

    const buildSectionHierarchy = (sections: Section[]): SectionWithChildren[] => {
        const sectionMap = new Map<string, SectionWithChildren>();

        sections.forEach((section) =>
            sectionMap.set(section.id, { ...section, children: [], classes: [] })
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
};


function SectionItem({
    section,
    onDelete,
    isAdmin,
    openEditOrAddModal,
    classes,
    BASE_URL
}: {
    readonly section: SectionWithChildren;
    readonly onDelete: (id: string) => void;
    readonly isAdmin: boolean;
    readonly openEditOrAddModal: (parent_id: string | null, id: string | null) => void;
    readonly classes: Classes[];
    readonly BASE_URL: string;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
        <div className="border rounded-md bg-gradient-to-r from-gray-50 to-gray-100">
            <div
                className="flex justify-between items-center p-4 bg-grey-100 cursor-pointer"
                onClick={toggleExpand}
            >
                <h3 className="text-2xl font-bold text-gray-800">{section.title}</h3>
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
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100">
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
                    <div className="mt-6 bg-white">
                        <ul className="space-y-6">
                            {classes.map((cls) => (
                                cls.section_id === section.id && (
                                    <div
                                        key={cls.id}
                                        className="p-6 border rounded-lg shadow-lg "
                                    >
                                        {/* Video Player */}
                                        <div className="aspect-w-16 aspect-h-9 mb-6 bg-white rounded-lg overflow-hidden">
                                            <ReactPlayer
                                                url={`${BASE_URL}/storage/v1/object/public/classes/${cls.section_id}/${cls.video_id}.mp4`}
                                                controls
                                                width="100%"
                                                height="90%"
                                                className="rounded-lg"
                                            />
                                        </div>

                                        {/* Title and Description */}
                                        <li>
                                            <h5 className="text-4xl font-extrabold text-gray-900 mb-8">
                                                {cls.title}
                                            </h5>
                                            <p className="text-lg text-gray-600">
                                                {cls.description}
                                            </p>
                                        </li>
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


export default SectionList;
