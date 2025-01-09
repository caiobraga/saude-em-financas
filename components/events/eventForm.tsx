import React, { useState, useEffect } from "react";

interface EventFormProps {
    onSubmit: (formData: FormData) => void;
    eventToEdit: Event | null;
}

interface Event {
    id: string;
    date: string;
    time: string;
    title: string;
    link: string;
    description: string;
    created_at: Date;
    updated_at: Date;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, eventToEdit }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    // Pre-fill form fields when editing
    useEffect(() => {
        if (eventToEdit) {
            setTitle(eventToEdit.title);
            setDescription(eventToEdit.description);
            setLink(eventToEdit.link);
            setDate(eventToEdit.date);
            setTime(eventToEdit.time);
        }
    }, [eventToEdit]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        onSubmit(formData);
    };

    return (
        <form className="bg-gray-100 p-4 rounded-md shadow-md" onSubmit={handleSubmit}>
            <h3 className="text-xl font-bold mb-2">
                {eventToEdit ? "Edit Event" : "Add Event"}
            </h3>

            <div className="grid gap-2 mt-2">
                <label htmlFor="title" className="text-sm text-gray-700">
                    Title
                </label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    className="border rounded-md p-2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <div className="grid gap-2 mt-2">
                <label htmlFor="link" className="text-sm text-gray-700">
                    Link
                </label>
                <textarea
                    id="link"
                    name="link"
                    className="border rounded-md p-2"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    required
                />
            </div>

            <div className="grid gap-2 mt-2">
                <label htmlFor="date" className="text-sm text-gray-700">
                    Date
                </label>
                <input
                    id="date"
                    name="date"
                    type="date"
                    className="border rounded-md p-2"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>

            <div className="grid gap-2 mt-2">
                <label htmlFor="time" className="text-sm text-gray-700">
                    Time Start
                </label>
                <input
                    id="time"
                    name="time"
                    type="time"
                    className="border rounded-md p-2"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                />
            </div>

            <button
                className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600"
                type="submit"
            >
                Submit
            </button>
        </form>
    );
};

export default EventForm;
