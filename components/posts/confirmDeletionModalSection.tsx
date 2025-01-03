import React from "react";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    ModalFooter,
    Button
} from "@nextui-org/react";

interface ConfirmDeletionSectionFormProps {
    title: string;
    onSubmit: () => void;
    isOpen: boolean;
    onOpenChange: () => void;
}

const ConfirmDeletionSectionForm: React.FC<ConfirmDeletionSectionFormProps> = ({ onSubmit, isOpen, onOpenChange, title }) => {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
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
                            <div className="bg-gray-100 p-4 rounded-md shadow-md">
                                <p className="mb-4 text-gray-700">
                                    Are you sure you want to delete this section? This action cannot be undone.
                                </p>
                                <div className="flex justify-end gap-4">
                                    <Button
                                        color="danger"
                                        onPress={() => {
                                            onSubmit();
                                            onClose();
                                        }}
                                        className="bg-red-500 text-white hover:bg-red-600"
                                    >
                                        Confirm
                                    </Button>
                                    <Button
                                        onPress={onClose}
                                        className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>


                        </ModalBody>

                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default ConfirmDeletionSectionForm;
