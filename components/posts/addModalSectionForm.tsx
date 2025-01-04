import React from "react";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
} from "@nextui-org/react";
import AddSectionForm from "./addSectionForm";

interface AddModalSectionFormProps {
    title: string;
    onSubmit: (formData: FormData) => void;
    isOpen: boolean;
    onOpenChange: () => void;
    sectionToEdit: Section | null;
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

const AddModalSectionForm: React.FC<AddModalSectionFormProps> = ({ onSubmit, isOpen, onOpenChange, title, sectionToEdit }) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}
            style={{ maxWidth: '500px', maxHeight: '400px' }}
            motionProps={{
                variants: {
                    enter: {
                        y: 0,
                        opacity: 1,
                        transition: {
                            duration: 0.3,
                            ease: "easeOut",
                        },
                    },
                    exit: {
                        y: -20,
                        opacity: 0,
                        transition: {
                            duration: 0.2,
                            ease: "easeIn",
                        },
                    },
                },
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
                        <ModalBody>
                            <AddSectionForm onSubmit={onSubmit} sectionToEdit={sectionToEdit} />
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default AddModalSectionForm;
