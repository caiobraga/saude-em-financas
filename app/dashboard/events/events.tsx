'use client';

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";

import "react-toastify/dist/ReactToastify.css";
import "./events.css";

import styled from "@emotion/styled";

// add styles as css
export const StyleWrapper = styled.div`
  .fc .fc-toolbar {
    margin-bottom: 1rem;
    background-color: #f8f9fa;
    border-radius: 0.375rem; /* Tailwind rounded-md */
    padding: 0.5rem;
  }

  .fc-button {
    background-color: #1d4ed8; /* Tailwind blue-600 */
    border: none;
    color: white;
    font-size: 0.875rem; /* Tailwind text-sm */
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s ease;
  }

  .fc-button:hover {
    background-color: #2563eb; /* Tailwind blue-700 */
  }

  .fc-daygrid-day-number {
    font-size: 0.875rem; /* Tailwind text-sm */
    color: #374151; /* Tailwind gray-700 */
  }

  .fc-event {
    background-color: #10b981; /* Tailwind green-500 */
    border: none;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem; /* Tailwind rounded-md */
  }

  .fc-event:hover {
    background-color: #059669; /* Tailwind green-600 */
  }

  .fc-toolbar-title {
    font-size: 1.125rem; /* Tailwind text-lg */
    font-weight: 600; /* Tailwind font-semibold */
    color: #1f2937; /* Tailwind gray-800 */
  }
`

import {
    getAvaliableTimes,
    insertAvaliableTime,
    updateAvaliableTime,
    deleteAvaliableTime,
    getRecessTimes,
    insertRecessTime,
    updateRecessTime,
    deleteRecessTime,
    getEvents,
    insertEvent,
    updateEvent,
    deleteEvent,
    insertAppointment,
    getAppointments,
    initGoogleCalendar,
    createGoogleCalendarEvent,
} from "./actions";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import AvailableTimeForm from "@/components/events/avaliableTimeForm";
import RecessTimeForm from "@/components/events/recessTimeForm";
import EventForm from "@/components/events/eventForm";
import { Modal } from "@nextui-org/react";
import ConfirmAddAppointmentForm from "@/components/events/confirmAddAppoitmentForm";
import { get } from "http";
import { google } from "googleapis";

interface EventsProps {
    user_name: string;
    userEmail: string;
    plan: string;
    access_level: "user" | "admin";
}

interface AvailableTime {
    id: string;
    days_of_the_week: string[] | null;
    time_start: string;
    time_end: string | null;
    time_before_request: string;
    created_at: Date;
    updated_at: Date;
}

interface RecessTime {
    id: string;
    days_of_the_week: string[] | null;
    time_start: string;
    time_end: string | null;
    created_at: Date;
    updated_at: Date;
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

interface Appointment {
    id: string;
    user_email: string;
    date: string;
    time: string;
    created_at: Date;
    updated_at: Date;
}

export default function Events({ user_name, userEmail, plan, access_level }: EventsProps) {
    const [availableTimes, setAvailableTimes] = useState<AvailableTime[]>([]);
    const [availableTimeToEdit, setAvailableTimeToEdit] = useState<AvailableTime | null>(null);
    const [recessTimes, setRecessTimes] = useState<RecessTime[]>([]);
    const [recessTimeToEdit, setRecessTimeToEdit] = useState<RecessTime | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

    const [appointments, setAppointments] = useState<Appointment[]>([]);


    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setAvailableTimes(await getAvaliableTimes());
                setRecessTimes(await getRecessTimes());
                setEvents(await getEvents());
                setAppointments(await getAppointments());
            } catch (error) {
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const getUserAppointments = () => {
        return appointments.filter((appointment) => appointment.user_email === userEmail);
    };

    const getAppointmentsOfTheDay = (date: string) => {
        return appointments.filter((appointment) => appointment.date === date);
    };

    const getEventsOfTheDay = (date: string) => {
        return events.filter((event) => event.date === date);
    };

    const getAvailableSlots = (date: string) => {
        const dayOfWeek = new Date(date).toLocaleString('en-US', { weekday: 'long' });

        // Find all available times for the given day
        const matchingAvailableTimes = availableTimes.filter((time) =>
            time.days_of_the_week?.includes(dayOfWeek) || time.days_of_the_week == null
        );

        const intervals: string[] = [];

        matchingAvailableTimes.forEach((availableTime) => {
            const startTime = new Date(`${date}T${availableTime.time_start}`);
            const endTime = new Date(`${date}T${availableTime.time_end}`);

            while (startTime < endTime) {
                const timeSlot = startTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                });

                const isRecess = recessTimes.some((recess) =>
                    recess.days_of_the_week?.includes(dayOfWeek) &&
                    timeSlot >= recess.time_start &&
                    (recess.time_end != null ? timeSlot < recess.time_end : true)
                );

                const isBooked = getAppointmentsOfTheDay(date).some(
                    (appointment) => appointment.time === timeSlot
                );

                const isEvent = getEventsOfTheDay(date).some(
                    (event) => event.time === timeSlot
                );

                if (!isRecess && !isBooked && !isEvent) {
                    intervals.push(timeSlot);
                }
                startTime.setHours(startTime.getHours() + 1);
            }
        });

        return Array.from(new Set(intervals)).sort((a, b) => a.localeCompare(b));
    };


    const handleDateSelect = (selectInfo: DateSelectArg) => {
        setSelectedDate(selectInfo.startStr);
        setIsModalOpen(true);
    };

    const handleTimeSlotClick = (timeSlot: string) => {
        setSelectedTimeSlot(timeSlot);
        setConfirmModalOpen(true);
    };

    const calendarId = process.env.CALENDAR_ID;

    const handleConfirmAppointment = async () => {
        if (!selectedDate || !selectedTimeSlot) {
            toast.error("Please select a valid date and time.");
            return;
        }

        const formData = new FormData();
        formData.append("user_email", userEmail);
        formData.append("date", selectedDate);
        formData.append("time", selectedTimeSlot);

        try {
            const appointments = await getAppointments();
            if (appointments.some((appointment) => appointment.date === selectedDate && appointment.time === selectedTimeSlot)) {
                toast.error("Appointment already exists for the selected date and time");
                return;
            }

            await insertAppointment(formData);

            const eventCreationResult = await createGoogleCalendarEvent({
                date: selectedDate,
                time: selectedTimeSlot,
                summary: 'Appointment',
                description: `Appointment with user: ${userEmail}`,
            });
            console.log(eventCreationResult);

            if (eventCreationResult.success) {
                toast.success("Appointment added successfully");
            } else {
                toast.error(`Failed to create calendar event: ${eventCreationResult.error}`);
            }

        } catch (error) {
            toast.error("Failed to add appointment");

        } finally {
            setConfirmModalOpen(false);
            setEvents(await getEvents());
            setAppointments(await getAppointments());
        }
    };



    const handleInsertAvailableTime = async (formData: FormData) => {
        try {
            if (availableTimeToEdit) {
                await updateAvaliableTime(availableTimeToEdit.id, formData);
                toast.success("Available time updated successfully");
            } else {
                await insertAvaliableTime(formData);
                toast.success("Available time added successfully");
            }
            setAvailableTimes(await getAvaliableTimes());
        } catch (error) {
            toast.error("Failed to save available time");
        } finally {
            setAvailableTimeToEdit(null);
        }
    };

    const handleEditAvailableTime = (availableTime: AvailableTime) => {
        setAvailableTimeToEdit(availableTime);
    };

    const handleDeleteAvailableTime = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this available time?")) {
            try {
                await deleteAvaliableTime(id);
                toast.success("Available time deleted successfully");
                setAvailableTimes(await getAvaliableTimes());
            } catch (error) {
                toast.error("Failed to delete available time");
            }
        }
    };

    const handleInsertRecessTime = async (formData: FormData) => {
        try {
            if (recessTimeToEdit) {
                await updateRecessTime(recessTimeToEdit.id, formData);
                toast.success("Recess time updated successfully");
            } else {
                await insertRecessTime(formData);
                toast.success("Recess time added successfully");
            }
            setRecessTimes(await getRecessTimes());
        } catch (error) {
            toast.error("Failed to save recess time");
        } finally {
            setRecessTimeToEdit(null);
        }
    };

    const handleEditRecessTime = (recessTime: RecessTime) => {
        setRecessTimeToEdit(recessTime);
    };

    const handleDeleteRecessTime = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this recess time?")) {
            try {
                await deleteRecessTime(id);
                toast.success("Recess time deleted successfully");
                setRecessTimes(await getRecessTimes());
            } catch (error) {
                toast.error("Failed to delete recess time");
            }
        }
    };

    const handleInsertEvent = async (formData: FormData) => {
        try {
            if (eventToEdit) {
                await updateEvent(eventToEdit.id, formData);
                toast.success("Event updated successfully");
            } else {
                await insertEvent(formData);
                toast.success("Event added successfully");
            }
            setEvents(await getEvents());
        } catch (error) {
            toast.error("Failed to save event");
        } finally {
            setEventToEdit(null);
        }
    };

    const handleEditEvent = (event: Event) => {
        setEventToEdit(event);
    };

    const handleDeleteEvent = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await deleteEvent(id);
                toast.success("Event deleted successfully");
                setEvents(await getEvents());
            } catch (error) {
                toast.error("Failed to delete event");
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Hello, {user_name}</h1>
            {access_level === "admin" && (
                <Tabs>
                    <TabList className="flex space-x-4 mb-4 border-b">
                        <Tab className="cursor-pointer p-2">Available Times</Tab>
                        <Tab className="cursor-pointer p-2">Recess Times</Tab>
                        <Tab className="cursor-pointer p-2">Events</Tab>
                    </TabList>

                    <TabPanel>
                        <AvailableTimeForm
                            onSubmit={handleInsertAvailableTime}
                            avaliableTimeToEdit={availableTimeToEdit}
                        />
                        {availableTimes.map((time) => (
                            <div
                                key={time.id}
                                className="bg-gray-100 p-4 rounded-md shadow-md flex justify-between items-center"
                            >
                                <div>
                                    <h3 className="text-xl font-bold">
                                        {time.time_start} - {time.time_end}
                                    </h3>
                                    <p>Days: {time.days_of_the_week?.join(", ")}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditAvailableTime(time)}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAvailableTime(time.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>

                        ))}
                    </TabPanel>

                    <TabPanel>
                        <RecessTimeForm
                            onSubmit={handleInsertRecessTime}
                            recessTimeToEdit={recessTimeToEdit}
                        />
                        {recessTimes.map((time) => (
                            <div
                                key={time.id}
                                className="bg-gray-100 p-4 rounded-md shadow-md flex justify-between items-center"
                            >
                                <div>
                                    <h3 className="text-xl font-bold">
                                        {time.time_start} - {time.time_end}
                                    </h3>
                                    <p>Days: {time.days_of_the_week?.join(", ")}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditRecessTime(time)}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteRecessTime(time.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </TabPanel>

                    <TabPanel>
                        <EventForm onSubmit={handleInsertEvent} eventToEdit={eventToEdit} />
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="bg-gray-100 p-4 rounded-md shadow-md flex justify-between items-center"
                            >
                                <div>
                                    <h3 className="text-xl font-bold">
                                        {event.date} - {event.time}
                                    </h3>
                                    <p>Link: {event.link}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditEvent(event)}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </TabPanel>
                </Tabs>
            )}
            <div>
                <div className="container flex justify-center items-center">
                    {/* Main Content */}
                    <div className="w-2/3 pr-2">
                        <h1 className="text-2xl font-bold mb-2">Hello, {user_name}</h1>
                        {loading && <p>Loading...</p>}
                        {!loading && (
                            <>
                                <h2 className="text-xl font-bold mb-2">Calendar</h2>
                                <div className="bg-white p-3 shadow rounded-md">
                                    <StyleWrapper>
                                        {
                                            access_level === "admin" ? (
                                                <FullCalendar
                                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                                    initialView="dayGridMonth"
                                                    events={[
                                                        ...events.map((e) => ({
                                                            id: e.id,
                                                            title: e.title,
                                                            start: e.date,
                                                            allDay: true,
                                                        })),
                                                        ...appointments.map((appointment) => ({
                                                            id: appointment.id,
                                                            title: `Appointment at ${appointment.time}`,
                                                            start: `${appointment.date}T${appointment.time}`,
                                                            color: access_level === "admin" ? "#FF5733" : "#10B981", // Differentiate colors for appointments
                                                        })),
                                                    ]}
                                                    selectable
                                                    select={handleDateSelect}
                                                    height="auto"
                                                />

                                            ) : (
                                                <FullCalendar
                                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                                    initialView="dayGridMonth"
                                                    events={[
                                                        ...events.map((e) => ({
                                                            id: e.id,
                                                            title: e.title,
                                                            start: e.date,
                                                            allDay: true,
                                                        })),
                                                        ...appointments
                                                            .filter((appointment) => appointment.user_email === userEmail)
                                                            .map((appointment) => ({
                                                                id: appointment.id,
                                                                title: `Appointment at ${appointment.time}`,
                                                                start: `${appointment.date}T${appointment.time}`,
                                                                color: '#FF5733',
                                                            })),
                                                    ]}
                                                    selectable
                                                    select={handleDateSelect}
                                                    height="auto"
                                                />
                                            )
                                        }

                                    </StyleWrapper>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right-Side Panel */}
                    <div className="mt-4 w-1/3 bg-gray-50 p-3 shadow-md rounded-md max-h-[400px] overflow-y-auto">
                        <h2 className="text-lg font-semibold mb-2">
                            {selectedDate ? `Details for ${selectedDate}` : "Select a Date"}
                        </h2>

                        <div className="space-y-4">
                            {/* Appointments */}
                            {getAppointmentsOfTheDay(selectedDate || "").map((appointment) => (
                                <div key={appointment.id} className="bg-red-100 p-2 rounded-md shadow">
                                    <h3 className="font-bold text-red-700 text-sm">Appointment</h3>
                                    <p className="text-xs">Time: {appointment.time}</p>
                                    <p className="text-xs">User: {appointment.user_email}</p>
                                </div>
                            ))}

                            {/* Events */}
                            {getEventsOfTheDay(selectedDate || "").map((event) => (
                                <div key={event.id} className="bg-blue-100 p-2 rounded-md shadow">
                                    <h3 className="font-bold text-blue-700 text-sm">Event</h3>
                                    <p className="text-xs">Title: {event.title}</p>
                                    <p className="text-xs">Time: {event.time}</p>
                                    {event.link && (
                                        <a
                                            href={event.link.startsWith('http') ? event.link : `https://${event.link}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 underline text-xs"
                                        >
                                            View Event Details
                                        </a>
                                    )}
                                </div>
                            ))}

                            {/* Available Slots */}
                            <h3 className="font-bold text-green-700 text-sm mt-2">Available Slots</h3>
                            {getAvailableSlots(selectedDate || "").map((slot, index) => (
                                <div
                                    key={index}
                                    className="bg-green-100 p-2 rounded-md shadow cursor-pointer hover:bg-green-200"
                                    onClick={() => handleTimeSlotClick(slot)}
                                >
                                    <p className="text-xs">{slot}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Confirmation Modal */}
                <ConfirmAddAppointmentForm
                    title="Confirm Appointment"
                    isOpen={confirmModalOpen}
                    onOpenChange={() => setConfirmModalOpen(false)}
                    onSubmit={handleConfirmAppointment}
                    appointmentDetails={{
                        date: selectedDate || "",
                        time: selectedTimeSlot || "",
                    }}
                />
            </div>
        </div >
    );
}
