import React from "react";

interface AddSectionFormProps {
    onSubmit: (formData: FormData) => void;
}

const AddSectionForm: React.FC<AddSectionFormProps> = ({ onSubmit }) => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        onSubmit(formData);
    };

    return (
        <form className="bg-gray-100 p-4 rounded-md shadow-md" onSubmit={handleSubmit}>
            <h3 className="text-xl font-bold mb-2">Add New Section</h3>

            <div className="grid gap-2 mt-2">
                <label htmlFor="order" className="text-sm text-gray-700">
                    Order
                </label>
                <input
                    id="order"
                    name="order"
                    type="number"
                    className="border rounded-md p-2"
                    required
                />
            </div>

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
                Add Section
            </button>
        </form>
    );
};

export default AddSectionForm;
