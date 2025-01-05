import React from "react";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
} from "@nextui-org/react";

interface SendNotificationFormProps {
    title: string;
    onSubmit: (formData: FormData) => void;
    isOpen: boolean;
    onOpenChange: () => void;
}

const SendNotificationForm: React.FC<SendNotificationFormProps> = ({ onSubmit, isOpen, onOpenChange, title }) => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        onSubmit(formData);
    };

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
                            <form
                                className="bg-gray-100 p-4 rounded-md shadow-md"
                                onSubmit={handleSubmit}
                            >
                                <h3 className="text-xl font-bold mb-2">Notifications</h3>

                                <div className="grid gap-2 mt-2">
                                    <label htmlFor="title" className="text-sm text-gray-700">
                                        Title
                                    </label>
                                    <input
                                        id="title"
                                        name="title"
                                        type="text"
                                        className="border rounded-md p-2"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2 mt-2">
                                    <label htmlFor="description" className="text-sm text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        className="border rounded-md p-2"
                                        required
                                    />
                                </div>

                                <button
                                    className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600"
                                    type="submit"
                                >
                                    Send Notification
                                </button>
                            </form>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default SendNotificationForm;
