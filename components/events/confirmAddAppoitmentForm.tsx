import React from "react";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    ModalFooter,
    Button
} from "@nextui-org/react";

interface ConfirmAddAppointmentFormProps {
    title: string;
    onSubmit: () => void;
    isOpen: boolean;
    onOpenChange: () => void;
    appointmentDetails: {
        date: string;
        time: string;
    };
}

const ConfirmAddAppointmentForm: React.FC<ConfirmAddAppointmentFormProps> = ({
    onSubmit,
    isOpen,
    onOpenChange,
    title,
    appointmentDetails
}) => {
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
                                    Are you sure you want to add this appointment?
                                </p>
                                <p className="mb-2"><strong>Date:</strong> {appointmentDetails.date}</p>
                                <p className="mb-4"><strong>Time:</strong> {appointmentDetails.time}</p>
                                <div className="flex justify-end gap-4">
                                    <Button
                                        color="success"
                                        onPress={() => {
                                            onSubmit();
                                            onClose();
                                        }}
                                        className="bg-green-500 text-white hover:bg-green-600"
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

export default ConfirmAddAppointmentForm;
