import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react"; // Import React hooks for using state and running effects (e.g. when component loads)
import { useDispatch } from "react-redux"; // Import hook to trigger Redux actions
import { Link, useNavigate } from "react-router-dom"; // Import React Router tools for linking and navigation
import { fetchOrdersByUser } from "../redux/slices/orderSlice"; // Import Redux action to fetch all orders for a specific user
import { doc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs, } from "firebase/firestore"; // Import Firebase Firestore functions to read/write data
import { db } from "../firebase/firebase"; // Import Firebase config
import "./pages.css"; // CSS styles for this page
import { useAppSelector } from "../redux/hooks"; // Import custom Redux hook to select data from the store
//Define how many orders to show on each page
const ORDERS_PER_PAGE = 9;
// Badge styles for different order statuses
const statusBadgeClasses = {
    pending: "bg-warning text-dark",
    processing: "bg-info text-dark",
    shipped: "bg-primary",
    delivered: "bg-success",
    cancelled: "bg-danger",
    refunded: "bg-secondary",
};
// Main component to show user's order history
export default function OrderHistory() {
    // Set up dispatch function to send actions to Redux store
    const dispatch = useDispatch();
    // Navigate to another page programmatically
    const navigate = useNavigate();
    // Get the currently logged-in user from Redux store
    const user = useAppSelector((state) => state.auth.user);
    // Get the order list, loading state, and error from Redux store
    const { orders, loading, error } = useAppSelector((state) => state.order);
    // Local state for pagination, status filter, order cancellation confirmation, and error message display
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const [confirmCancelId, setConfirmCancelId] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    // When component mounts (and whenever user ID changes), fetch that user's orders
    useEffect(() => {
        if (user?.uid) {
            dispatch(fetchOrdersByUser(user.uid));
        }
    }, [dispatch, user?.uid]); // Run when the dispatch function or user ID changes
    // Apply status filter to the orders list
    const filteredOrders = statusFilter === "all"
        ? orders
        : orders.filter((order) => order.status === statusFilter);
    // Calculate how many pages of orders exist
    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
    // Get the correct slice of orders for the current page
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    const currentOrders = filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
    // Function to cancel an order
    async function cancelOrder(order) {
        try {
            const { id: orderId, userId, items } = order;
            const orderRef = doc(db, "orders", orderId);
            // Mark the order as "cancelled" in Firestore
            await updateDoc(orderRef, { status: "cancelled" });
            // Prepare a reference to the notifications collection
            const notificationsRef = collection(db, "notifications");
            // Extract product images from the order (filter out missing ones)
            const images = items
                .map((item) => item.image)
                .filter((img) => !!img);
            // Add a notification for the user
            await addDoc(notificationsRef, {
                userId,
                message: `❌ Your order ${orderId} has been cancelled.`,
                status: "cancelled",
                images,
                createdAt: serverTimestamp(),
                read: false,
            });
            // Find all admin users
            const usersRef = collection(db, "users");
            const adminQuery = query(usersRef, where("role", "==", "admin"));
            const adminSnapshot = await getDocs(adminQuery);
            //  Notify each admin that the order was cancelled
            const adminNotifPromises = adminSnapshot.docs.map((adminDoc) => addDoc(notificationsRef, {
                userId: adminDoc.id,
                message: `❌ Order ${orderId} by user ${userId} has been cancelled.`,
                status: "cancelled",
                images,
                createdAt: serverTimestamp(),
                read: false,
            }));
            await Promise.all(adminNotifPromises);
        }
        catch (error) {
            console.error("Failed to cancel order:", error);
            throw error;
        }
    }
    // Show loading spinner while fetching orders
    if (loading) {
        return (_jsxs("div", { className: "container text-center mt-5", children: [_jsx("div", { className: "spinner-border text-primary", role: "status" }), _jsx("p", { className: "mt-3", children: "Loading your orders..." })] }));
    }
    // Show error if there was a problem loading orders
    if (error) {
        return (_jsxs("div", { className: "container text-center mt-5", children: [_jsxs("p", { className: "text-danger fw-semibold", children: ["\u26A0\uFE0F Failed to load orders: ", error] }), _jsx("button", { className: "btn btn-outline-primary mt-2", onClick: () => window.location.reload(), children: "Retry" })] }));
    }
    return (_jsxs("div", { className: "container-fluid mt-5 mb-5 pb-5 custom-container", children: [_jsxs("div", { className: "mb-4 position-relative", children: [_jsx("h2", { className: "text-center mb-4", children: "\uD83E\uDDFE Your Order History" }), _jsxs("div", { className: "px-3 px-md-0 d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2", children: [_jsx("label", { htmlFor: "statusFilter", className: "form-label fw-semibold mb-0", children: "Filter by Status:" }), _jsxs("select", { id: "statusFilter", className: "form-select", style: { maxWidth: "200px", minWidth: "150px", width: "100%" }, value: statusFilter, onChange: (e) => {
                                    setCurrentPage(1);
                                    setStatusFilter(e.target.value);
                                }, children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "in process", children: "In Process" }), _jsx("option", { value: "cancelled", children: "Cancelled" }), _jsx("option", { value: "refunded", children: "Refunded" }), _jsx("option", { value: "delivered", children: "Delivered" })] }), statusFilter !== "all" && (_jsx("button", { className: "btn btn-sm btn-outline-danger mt-2 mt-md-0", onClick: () => {
                                    setStatusFilter("all");
                                    setCurrentPage(1);
                                }, children: "Clear Filter" }))] })] }), filteredOrders.length === 0 ? (_jsx("p", { children: "No orders match the selected filter." })) : (
            // Render orders in a grid
            _jsx("div", { className: "order-grid", children: currentOrders.map((order) => {
                    const orderDate = new Date(order.createdAt).toLocaleString();
                    const badgeClass = statusBadgeClasses[order.status.toLowerCase()] || "bg-secondary";
                    const status = order.status.toLowerCase();
                    return (_jsx("div", { className: "order-card", children: _jsxs("div", { className: "card shadow-sm h-100 order-details", children: [_jsxs("div", { className: "card-header bg-light", children: [_jsx("strong", { children: "Order ID:" }), " ", order.id, " ", _jsx("br", {}), _jsx("strong", { children: "Status:" }), " ", _jsx("span", { className: `badge ${badgeClass} text-uppercase`, children: order.status }), _jsx("br", {}), _jsx("strong", { children: "Date:" }), " ", orderDate, " ", _jsx("br", {}), _jsx("strong", { children: "Total:" }), " $", order.total.toFixed(2)] }), _jsx("ul", { className: "list-group list-group-flush", children: order.items.map((item, index) => (_jsxs("li", { className: "list-group-item d-flex justify-content-between align-items-center", children: [_jsx("img", { src: item.image, alt: item.title, width: "50", height: "50", className: "object-fit-contain me-2" }), _jsxs("div", { className: "flex-grow-1", children: [_jsx("div", { className: "fw-semibold", children: item.title }), _jsxs("small", { className: "text-muted", children: ["$", item.price.toFixed(2), " \u00D7 ", item.quantity] })] })] }, `${item.id ?? index}-${order.id}`))) }), _jsxs("div", { className: "card-footer text-end bg-white", children: [_jsx(Link, { to: `/orders/${order.id}`, className: "btn btn-sm btn-outline-primary me-2", children: "Details" }), (status === "pending" || status === "in process") && (_jsx(_Fragment, { children: confirmCancelId === order.id ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "me-2", children: "Confirm cancel?" }), _jsx("button", { className: "btn btn-sm btn-danger me-2", onClick: async () => {
                                                            if (!user?.uid)
                                                                return;
                                                            try {
                                                                await cancelOrder(order);
                                                                await dispatch(fetchOrdersByUser(user.uid));
                                                                setConfirmCancelId(null);
                                                                setErrorMessage(null);
                                                            }
                                                            catch {
                                                                setErrorMessage("❌ Failed to cancel the order. Please try again.");
                                                            }
                                                        }, children: "Yes" }), _jsx("button", { className: "btn btn-sm btn-secondary", onClick: () => {
                                                            setConfirmCancelId(null);
                                                            setErrorMessage(null);
                                                        }, children: "No" }), errorMessage && confirmCancelId === order.id && (_jsx("div", { className: "text-danger mt-2 small", children: errorMessage }))] })) : (_jsx("button", { className: "btn btn-sm btn-outline-secondary cancel-order-btn", onClick: () => setConfirmCancelId(order.id), children: "Cancel" })) }))] })] }) }, order.id));
                }) })), filteredOrders.length > ORDERS_PER_PAGE && (_jsxs("div", { className: "d-flex justify-content-center align-items-center gap-3 my-4", children: [_jsx("button", { className: "pagination-btn", onClick: () => setCurrentPage((prev) => prev - 1), disabled: currentPage === 1, children: "\u2B05\uFE0F Prev" }), _jsxs("span", { className: "fw-semibold", children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { className: "pagination-btn", onClick: () => setCurrentPage((prev) => prev + 1), disabled: currentPage === totalPages, children: "Next \u27A1\uFE0F" })] })), _jsx("div", { className: "text-center mt-5", children: _jsx("button", { className: "btn btn-primary", onClick: () => navigate("/"), children: "Back to Home" }) })] }));
}
