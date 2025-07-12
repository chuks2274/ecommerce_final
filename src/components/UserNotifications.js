import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react"; // Import React hooks for managing side effects and state
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, } from "firebase/firestore"; // Import Firestore functions to query, listen, order, and delete documents
import { db } from "../firebase/firebase"; // Import Firestore database configuration
import { useAuth } from "../hooks/useAuth"; // Import custom hook to get currently logged-in user
import { markNotificationAsRead } from "../firebase/services/notificationService"; // Import service to mark a notification as read
import { useNavigate } from "react-router-dom"; // For navigation
import "./components.css"; // Import CSS styles for components
// Defines the UserNotifications component
export default function UserNotifications() {
    // Local states: notifications list, error message, and current pagination page
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    // Get the currently logged-in user from custom auth hook
    const { currentUser } = useAuth();
    // Function to programmatically navigate between routes
    const navigate = useNavigate();
    // Define how many notifications to show per page
    const itemsPerPage = 8;
    // Run this effect when the component mounts or when currentUser changes
    useEffect(() => {
        if (!currentUser)
            return;
        try {
            // Create a Firestore query: get notifications for current user, ordered by newest first
            const q = query(collection(db, "notifications"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"));
            // Listen to real-time updates from Firestore
            const unsubscribe = onSnapshot(q, (snapshot) => {
                // Map Firestore documents into Notification objects with IDs
                const notifs = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(), // get all other data except id
                }));
                // Update the state with fetched notifications
                setNotifications(notifs);
                setError(null);
                setCurrentPage(1);
            }, (err) => {
                console.error("Error fetching notifications:", err);
                setError("Failed to load notifications.");
            });
            // Clean up the listener when component unmounts or currentUser changes
            return () => unsubscribe();
        }
        catch (err) {
            console.error("Unexpected error:", err);
            setError("Something went wrong.");
        }
    }, [currentUser]); // Run when currentUser changes
    // Function to delete a notification by its ID
    async function handleDelete(id) {
        try {
            // Remove the notification from Firestore
            await deleteDoc(doc(db, "notifications", id));
            setError(null);
        }
        catch (err) {
            console.error("Error deleting notification:", err);
            setError("Failed to delete notification. Please try again.");
        }
    }
    // If no user is logged in, don’t show anything
    if (!currentUser)
        return null;
    // Calculate total number of pages based on notifications count and items per page
    const totalPages = Math.ceil(notifications.length / itemsPerPage);
    // Calculate the starting index of the notifications to show for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    // Slice the notifications array to get only those that should be shown on the current page
    const currentNotifications = notifications.slice(startIndex, startIndex + itemsPerPage);
    return (_jsxs("div", { className: "container mt-4", children: [_jsx("h4", { className: "notification-heading", children: "\uD83D\uDCEC Notifications" }), error && (_jsx("div", { className: "alert alert-danger", role: "alert", children: error })), _jsx("ul", { className: "list-group", children: currentNotifications.map((notif) => (_jsxs("li", { className: `list-group-item d-flex justify-content-between align-items-start ${notif.read ? "" : "bg-light"}`, style: {
                        fontWeight: notif.read ? "normal" : "bold",
                        cursor: "pointer",
                    }, onClick: () => {
                        // Mark as read if not already
                        if (!notif.read && notif.id) {
                            markNotificationAsRead(notif.id);
                        }
                    }, children: [_jsxs("div", { className: "me-auto d-flex flex-column", children: [(notif.images && notif.images.length > 0
                                    ? notif.images
                                    : notif.image
                                        ? [notif.image]
                                        : []).length > 0 && (_jsx("div", { style: {
                                        display: "flex",
                                        gap: "8px",
                                        marginBottom: "8px",
                                    }, children: (notif.images && notif.images.length > 0
                                        ? notif.images
                                        : notif.image
                                            ? [notif.image]
                                            : []).map((img, i) => (_jsx("img", { src: img, alt: `Product ${i + 1}`, style: {
                                            width: 80,
                                            height: 80,
                                            objectFit: "cover",
                                            borderRadius: 8,
                                        } }, i))) })), _jsx("div", { children: notif.message }), _jsx("small", { className: "text-muted", children: notif.createdAt
                                        ? new Date(notif.createdAt.seconds * 1000).toLocaleString()
                                        : "" })] }), _jsx("button", { className: "btn btn-sm btn-outline-danger notif-delete-btn", onClick: (e) => {
                                e.stopPropagation();
                                handleDelete(notif.id);
                            }, title: "Delete notification", children: "\u274C" })] }, notif.id))) }), totalPages > 1 && (_jsx("div", { className: "mt-3 d-flex justify-content-center", children: _jsxs("div", { className: "d-flex align-items-center gap-3", children: [_jsx("button", { className: "btn btn-primary", onClick: () => setCurrentPage((prev) => prev - 1), disabled: currentPage === 1, children: "\u2B05\uFE0F Prev" }), _jsxs("span", { className: "fw-semibold", children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { className: "btn btn-primary", onClick: () => setCurrentPage((prev) => prev + 1), disabled: currentPage >= totalPages, children: "Next \u27A1\uFE0F" })] }) })), _jsx("div", { className: "mt-4 d-flex justify-content-center", children: _jsx("button", { className: "btn btn-primary mb-4", onClick: () => navigate("/"), children: "Back to Home" }) })] }));
}
