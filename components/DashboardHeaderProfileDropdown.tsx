import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, MessageSquare, ReceiptText, User, Settings, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDisclosure } from "@nextui-org/react";
import { getNotifications, getUserNotification, insertNotification, insertUserNotification } from "@/app/dashboard/actions";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import SendNotificationForm from "./SendNotificationForm";
import { logout } from "@/app/auth/actions";
import ReactDOM from "react-dom";

interface DashboardHeaderProfileDropdownProps {
    readonly access_level: "user" | "admin";
    readonly user_email: string;
}

interface Notification {
    id: string;
    title: string;
    description: string;
    created_at: Date;
    updated_at: Date;
}

interface UserNotification {
    id: string;
    user_email: string;
    notification_id: string;
    seen: string;
    created_at: Date;
    updated_at: Date;
}

export default function DashboardHeaderProfileDropdown({ user_email, access_level }: DashboardHeaderProfileDropdownProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const notificationResponse = await getNotifications();
                setNotifications(notificationResponse || []);
                const userNotificationResponse = await getUserNotification();
                setUserNotifications(userNotificationResponse || []);
            } catch (error) {
                console.error("Error fetching notifications:", error);
                toast.error("Failed to fetch notifications.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleSendMessage = async (formData: FormData) => {
        try {
            const title = formData.get("title") as string;
            const description = formData.get("description") as string;
            const userEmail = user_email;
            console.log("Sending notification:", title, description, userEmail);
            await insertNotification(title, description, userEmail);
            toast.success("Notification sent successfully.");
            const notificationResponse = await getNotifications();
            setNotifications(notificationResponse || []);
            const userNotificationResponse = await getUserNotification();
            setUserNotifications(userNotificationResponse || []);
        } catch (error) {
            console.error("Error sending notification:", error);
            toast.error("Failed to send notification.");
        }
    };

    const setNotificationSeenForUser = async (notification_id: string) => {
        try {
            await insertUserNotification(user_email, notification_id);
            setUserNotifications((prev) =>
                prev.map((userNotif) =>
                    userNotif.notification_id === notification_id ? { ...userNotif, seen: "true" } : userNotif
                )
            );
            const notificationResponse = await getNotifications();
            setNotifications(notificationResponse || []);
            const userNotificationResponse = await getUserNotification();
            setUserNotifications(userNotificationResponse || []);
        } catch (error) {
            console.error("Error marking notification as seen:", error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        setSelectedNotification(notification);
        setNotificationSeenForUser(notification.id);
    };

    return (
        <nav className="flex items-center">
            {access_level === "admin" && (
                <Button variant="ghost" size="icon" className="mr-2" onClick={onOpen}>
                    <MessageSquare className="h-4 w-4" />
                    <span className="sr-only">Send Message</span>
                </Button>
            )}

            {access_level === "admin" && (
                <SendNotificationForm
                    title="Send Notification"
                    onSubmit={handleSendMessage}
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                />
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-4 w-4" />
                        <span className="sr-only">Notifications</span>
                        {notifications.some(
                            (notif) =>
                                !userNotifications.find(
                                    (userNotif) => userNotif.notification_id === notif.id && userNotif.seen === "true"
                                )
                        ) && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <span className="text-gray-500">Loading...</span>
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((notification) => {
                            const isSeen = userNotifications.some(
                                (userNotif) => userNotif.notification_id === notification.id && userNotif.seen === "true"
                            );
                            return (
                                <DropdownMenuItem
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`cursor-pointer ${isSeen ? "bg-gray-100" : "bg-blue-100 font-bold"
                                        }`}
                                >
                                    <span>{notification.title}</span>
                                </DropdownMenuItem>
                            );
                        })
                    ) : (
                        <div className="text-center text-gray-500 py-4">No notifications yet.</div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <User className="h-4 w-4" />
                        <span className="sr-only">Open user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="#">
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                    </Link>
                    <Link href="#">
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                    </Link>
                    <Link href="#">
                        <DropdownMenuItem>
                            <ReceiptText className="mr-2 h-4 w-4" />
                            <Link href="https://dashboard.stripe.com/billing/portal">Billing</Link>
                        </DropdownMenuItem>
                    </Link>
                    <Link href="#">
                        <DropdownMenuItem>
                            <HelpCircle className="mr-2 h-4 w-4" />
                            <span>Help</span>
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <form action={logout} className="w-full">
                            <button type="submit" className="w-full flex">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </button>
                        </form>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {selectedNotification &&
                ReactDOM.createPortal(
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="relative w-96 p-6 bg-white shadow-lg rounded-lg">
                            <button
                                onClick={() => setSelectedNotification(null)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                            <h4 className="text-lg font-bold mb-2">{selectedNotification.title}</h4>
                            <p className="text-sm text-gray-600">{selectedNotification.description}</p>
                        </div>
                    </div>,
                    document.body
                )
            }

        </nav>
    );
}
