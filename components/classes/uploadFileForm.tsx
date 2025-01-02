import React, { useState } from "react";
import { toast } from "react-toastify";
import { CircularProgress } from "@nextui-org/react";

interface Section {
    id: string;
    parent_id: string | null;
    order: number;
    title: string;
    description: string;
    created_at: Date;
    updated_at: Date;
}

interface UploadFileFormProps {
    videoUpload: (formData: FormData) => Promise<any>;
    sectionOptions: Section[];
    loadingAddVideo: boolean;
    setLoadingAddVideo: (loading: boolean) => void;
}

const UploadFileForm: React.FC<UploadFileFormProps> = ({ videoUpload, sectionOptions, loadingAddVideo,
    setLoadingAddVideo }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [sectionId, setSectionId] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [order, setOrder] = useState<number>(0);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(Array.from(event.target.files));
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files) {
            setSelectedFiles(Array.from(event.dataTransfer.files));
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
    };

    const handleUpload = async () => {
        if (!selectedFiles.length || !sectionId) {
            toast.error("Please select a file and section to upload.");
            return;
        }

        setLoadingAddVideo(true);

        try {
            const formData = new FormData();
            formData.append("section_id", sectionId);
            selectedFiles.forEach((file) => formData.append("file", file));
            formData.append("title", title);
            formData.append("description", description);
            formData.append("order", order.toString());

            const response = await videoUpload(formData);
            if (response.message) {
                toast.error(response.message);
                return;
            }
            toast.success("Files uploaded successfully.");
            setSelectedFiles([]); // Clear files after upload
        } catch (error) {
            console.error("Error uploading files:", error);
            toast.error("Failed to upload files. Please try again.");
        } finally {
            setLoadingAddVideo(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full">
            {
                loadingAddVideo ? (
                    <div className="flex items-center justify-center w-full h-64 bg-gray-100 dark:bg-gray-700">
                        <CircularProgress aria-label="Loading..." size="md" />
                        Uploading video...
                    </div>
                ) : (
                    <>
                        {/* Drag-and-Drop Area */}
                        < label
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg
                                    className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 20 16"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                    />
                                </svg>
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    MP4 (MAX. 800x400px)
                                </p>
                            </div>
                            <input
                                id="dropzone-file"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                multiple
                            />
                        </label>

                        {/* File Preview */}
                        {
                            selectedFiles.length > 0 && (
                                <div className="mt-4 w-full">
                                    <h4 className="text-gray-700 font-semibold mb-2">Selected Files:</h4>
                                    <ul className="list-disc list-inside text-gray-600">
                                        {selectedFiles.map((file, index) => (
                                            <li key={index}>{file.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        }

                        {/* title and description */}
                        <div className="mt-4 w-full flex justify-between items-center">
                            <input
                                type="text"
                                placeholder="Title"
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:outline-none w-1/2"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:outline-none w-1/2"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Dropdown and Save buttons */}
                        <div className="mt-4 w-full flex justify-between items-center">
                            {/* Dropdown for Section ID */}
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:outline-none"
                                value={sectionId}
                                onChange={(e) => setSectionId(e.target.value)}
                            >
                                <option value="" disabled>Select Section</option>
                                {sectionOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.title}
                                    </option>
                                ))}
                            </select>

                            {/* order */}
                            <input
                                type="number"
                                placeholder="Order"
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white shadow-sm focus:ring focus:ring-blue-300 focus:outline-none"
                                value={order}
                                onChange={(e) => setOrder(Number(e.target.value))} />

                            {/* Upload Button */}
                            <button
                                onClick={handleUpload}
                                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow hover:bg-blue-600 focus:ring focus:ring-blue-300 focus:outline-none"
                            >
                                Upload
                            </button>
                        </div>
                    </>

                )
            }

        </div >
    );
};

export default UploadFileForm;
