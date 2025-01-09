import React, { useState, useEffect } from "react";
import Select from "react-select";

interface RecessTimeFormProps {
    onSubmit: (formData: FormData) => void;
    recessTimeToEdit: RecessTime | null;
}

interface RecessTime {
    id: string;
    days_of_the_week: string[] | null;
    time_start: string;
    time_end: string | null;
    created_at: Date;
    updated_at: Date;
}

const RecessTimeForm: React.FC<RecessTimeFormProps> = ({ onSubmit, recessTimeToEdit }) => {
    const [selectedDays, setSelectedDays] = useState<{ value: string; label: string }[]>([]);
    const [timeStart, setTimeStart] = useState("");
    const [timeEnd, setTimeEnd] = useState("");

    // Pre-fill form fields when editing
    useEffect(() => {
        if (recessTimeToEdit) {
            setSelectedDays(
                recessTimeToEdit.days_of_the_week?.map((day) => ({ value: day, label: day })) || []
            );
            setTimeStart(recessTimeToEdit.time_start);
            setTimeEnd(recessTimeToEdit.time_end || "");
        }
    }, [recessTimeToEdit]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        // Combine selected days into a comma-separated string
        const daysOfTheWeek = selectedDays.map((day) => day.value).join(',');
        formData.set('days_of_the_week', daysOfTheWeek);

        onSubmit(formData);
    };

    const dayOptions = [
        { value: "Monday", label: "Monday" },
        { value: "Tuesday", label: "Tuesday" },
        { value: "Wednesday", label: "Wednesday" },
        { value: "Thursday", label: "Thursday" },
        { value: "Friday", label: "Friday" },
        { value: "Saturday", label: "Saturday" },
        { value: "Sunday", label: "Sunday" },
    ];

    return (
        <form className="bg-gray-100 p-4 rounded-md shadow-md" onSubmit={handleSubmit}>
            <h3 className="text-xl font-bold mb-2">
                {recessTimeToEdit ? "Edit Recess Time" : "Add Recess Time"}
            </h3>

            <div className="grid gap-2 mt-2">
                <label htmlFor="days_of_the_week" className="text-sm text-gray-700">
                    Days of the Week
                </label>
                <Select
                    id="days_of_the_week"
                    isMulti
                    options={dayOptions}
                    value={selectedDays}
                    onChange={(selected) => setSelectedDays(selected as { value: string; label: string }[])}
                    className="border rounded-md"
                />
            </div>

            <div className="grid gap-2 mt-2">
                <label htmlFor="time_start" className="text-sm text-gray-700">
                    Time Start
                </label>
                <input
                    id="time_start"
                    name="time_start"
                    type="time"
                    className="border rounded-md p-2"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    required
                />
            </div>

            <div className="grid gap-2 mt-2">
                <label htmlFor="time_end" className="text-sm text-gray-700">
                    Time End
                </label>
                <input
                    id="time_end"
                    name="time_end"
                    type="time"
                    className="border rounded-md p-2"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    required
                />
            </div>

            <button className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-600" type="submit">
                Submit
            </button>
        </form>
    );
};

export default RecessTimeForm;
