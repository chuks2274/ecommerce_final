import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react"; // Import React hooks to handle side effects and component state
import { collection, getDocs, doc, updateDoc, Timestamp, deleteDoc, addDoc, serverTimestamp, } from "firebase/firestore"; // Import Firestore tools to read/write data from the database
import { db } from "../../firebase/firebase"; // Import the Firestore database configuration
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase Authentication tools to check if user is logged in
import "../pages.css"; // Import global CSS styling for the page
import { toLocalDatetimeInputString } from "../../utils/dateUtils"; // Import Utility function to format dates
// Initialize Firebase Auth instance for authentication operations
const auth = getAuth();
// Main component to manage all admin order operations
export function AdminOrderManagement() {
    // Local state for orders, loading/errors, pagination, filters, saving, delete confirm, and current user
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateError, setUpdateError] = useState(null);
    const [savingOrderId, setSavingOrderId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState("all");
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [user, setUser] = useState(null);
    // Number of orders per page for pagination
    const ordersPerPage = 5;
    // Run this when component first loads
    useEffect(() => {
        // Watch for auth changes (login/logout)
        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // Set current user and fetch orders
                setUser({ uid: firebaseUser.uid, isAdmin: true });
                fetchOrders();
            }
            else {
                // No user logged in
                setUser(null);
                setLoading(false);
                setError("You must be logged in to view orders.");
            }
        });
        // Fetch all orders from Firestore and map each document to an Order object, spreading all fields except 'id' which is added separately
        async function fetchOrders() {
            try {
                setLoading(true);
                setError(null);
                const snapshot = await getDocs(collection(db, "orders"));
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                // Sort orders by newest first (most recent createdAt first)
                setOrders(data.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds));
            }
            catch (err) {
                const error = err;
                setError("Failed to load orders.");
                console.error("Error fetching orders:", error.code, error.message);
            }
            finally {
                setLoading(false);
            }
        }
        // Cleanup auth listener when component unmounts
        return () => unsubscribeAuth();
    }, []); // Run only once on component mount.
    // Function to update a specific order in the database
    async function updateOrder(orderId, updatedFields) {
        try {
            setSavingOrderId(orderId);
            setUpdateError(null);
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, updatedFields);
            // Update local state with new order data
            setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, ...updatedFields } : order));
        }
        catch (error) {
            setUpdateError("Failed to update order");
            console.error("Update order error:", error);
        }
        finally {
            setSavingOrderId(null);
        }
    }
    // Shortcut function to update status and estimated delivery at once
    async function updateStatusAndEstimatedDelivery(orderId, status, estimatedDelivery) {
        const order = orders.find((o) => o.id === orderId);
        if (!order)
            return;
        // Update the order in Firestore
        await updateOrder(orderId, { status, estimatedDelivery });
        // Set notification message
        let message = "";
        const statusLower = status.toLowerCase();
        if (statusLower === "delivered") {
            message = `🎉 Your order ${orderId} has been delivered!`;
        }
        else if (statusLower === "refunded") {
            message = `💸 Your order ${orderId} has been refunded.`;
        }
        else if (estimatedDelivery) {
            // Format date nicely with time included
            const fullDateStr = new Date(estimatedDelivery.seconds * 1000).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });
            const lastCommaIndex = fullDateStr.lastIndexOf(",");
            const datePart = fullDateStr.slice(0, lastCommaIndex);
            const timePart = fullDateStr.slice(lastCommaIndex + 1).trim();
            const dateStr = `${datePart} at ${timePart}`;
            message = `📦 Your order ${orderId} is now ${statusLower} and estimated for delivery on ${dateStr}.`;
        }
        else {
            message = `📦 Your order ${orderId} is now ${statusLower}.`;
        }
        // Create a new notification in Firestore including all product images and titles
        try {
            const images = order.items
                .map((item) => item.image)
                .filter((img) => !!img);
            const productTitles = order.items.map((item) => item.title);
            await addDoc(collection(db, "notifications"), {
                userId: order.userId,
                message,
                status,
                images, // Array of all product images
                productTitles, // Array of all product titles
                createdAt: serverTimestamp(),
                read: false,
            });
        }
        catch (err) {
            console.error("Notification error:", err);
        }
    }
    // Delete an order from Firestore
    async function deleteOrder(orderId) {
        try {
            setSavingOrderId(orderId);
            const orderRef = doc(db, "orders", orderId);
            await deleteDoc(orderRef);
            // Remove order from local state
            setOrders((prev) => prev.filter((order) => order.id !== orderId));
        }
        catch (error) {
            setUpdateError("Failed to delete order");
            console.error("Delete order error:", error);
        }
        finally {
            setSavingOrderId(null);
            setConfirmDeleteId(null);
        }
    }
    if (loading)
        return _jsx("p", { children: "Loading orders..." });
    if (error)
        return _jsx("p", { className: "text-danger", children: error });
    // Filter orders by selected status
    const filteredOrders = filterStatus === "all"
        ? orders
        : orders.filter((order) => order.status === filterStatus);
    // Calculate which orders to show for current page
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    return (_jsxs("div", { className: "admin-order-container container mt-4", children: [_jsx("h2", { className: "mb-4 text-center", children: "Admin Order Management" }), updateError && (_jsx("div", { className: "alert alert-danger", role: "alert", children: updateError })), _jsxs("div", { className: "mb-3", children: [_jsx("h5", { children: "Filter by status" }), _jsxs("div", { className: "d-flex align-items-center gap-2", children: [_jsxs("select", { className: "form-select", style: { maxWidth: "200px", minWidth: "150px" }, value: filterStatus, onChange: (e) => {
                                    setCurrentPage(1);
                                    setFilterStatus(e.target.value);
                                }, children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "in process", children: "In Process" }), _jsx("option", { value: "cancelled", children: "Cancelled" }), _jsx("option", { value: "refunded", children: "Refunded" }), _jsx("option", { value: "shipped", children: "Shipped" }), _jsx("option", { value: "delivered", children: "Delivered" })] }), filterStatus !== "all" && (_jsx("button", { onClick: () => setFilterStatus("all"), className: "btn btn-outline-danger btn-sm", style: { whiteSpace: "nowrap" }, children: "Clear Filter" }))] })] }), _jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-striped table-bordered admin-order-table", children: [_jsx("thead", { className: "table-dark text-center", children: _jsxs("tr", { children: [_jsx("th", { children: "Order ID" }), _jsx("th", { children: "User" }), _jsx("th", { children: "Item Count" }), _jsx("th", { children: "Created At" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Estimated Delivery (Edit)" }), _jsx("th", { children: "Estimated Delivery (Display)" }), _jsx("th", { children: "Total" }), _jsx("th", { children: "Actions" }), _jsx("th", { children: "Delete" })] }) }), _jsx("tbody", { children: currentOrders.map((order) => (_jsxs("tr", { children: [_jsx("td", { children: order.id }), _jsx("td", { className: "text-nowrap", children: order.userId }), _jsx("td", { children: order.items.length }), _jsx("td", { children: new Date(order.createdAt.seconds * 1000).toLocaleString() }), _jsx("td", { children: _jsxs("select", { value: order.status, onChange: (e) => updateStatusAndEstimatedDelivery(order.id, e.target.value, order.estimatedDelivery), disabled: savingOrderId === order.id, className: "form-select form-select-sm", style: { minWidth: "130px" }, children: [_jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "in process", children: "In Process" }), _jsx("option", { value: "refunded", children: "Refunded" }), user?.isAdmin && (_jsxs(_Fragment, { children: [_jsx("option", { value: "shipped", children: "Shipped" }), _jsx("option", { value: "delivered", children: "Delivered" })] }))] }) }), _jsx("td", { children: _jsx("input", { type: "datetime-local", value: order.estimatedDelivery
                                                ? toLocalDatetimeInputString(new Date(order.estimatedDelivery.seconds * 1000))
                                                : "", onChange: (e) => {
                                                const newDate = e.target.value
                                                    ? Timestamp.fromDate(new Date(e.target.value))
                                                    : null;
                                                updateStatusAndEstimatedDelivery(order.id, order.status, newDate);
                                            }, disabled: savingOrderId === order.id, className: "form-control form-control-sm" }) }), _jsx("td", { children: order.estimatedDelivery
                                            ? new Date(order.estimatedDelivery.seconds * 1000).toLocaleString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                                hour12: true,
                                            })
                                            : "Not set" }), _jsxs("td", { children: ["$", order.total.toFixed(2)] }), _jsxs("td", { children: [savingOrderId === order.id && (_jsx("span", { className: "text-muted d-block mb-1", children: "Saving..." })), _jsxs("div", { className: "d-flex flex-column gap-2", children: [_jsx("button", { className: "btn btn-sm btn-primary", disabled: savingOrderId === order.id || order.status === "shipped", onClick: () => updateStatusAndEstimatedDelivery(order.id, "shipped", order.estimatedDelivery), style: { whiteSpace: "nowrap" }, children: "Mark as Shipped" }), _jsx("button", { className: "btn btn-sm btn-success", disabled: savingOrderId === order.id ||
                                                            order.status === "delivered", onClick: () => updateStatusAndEstimatedDelivery(order.id, "delivered", order.estimatedDelivery), style: { whiteSpace: "nowrap" }, children: "Mark as Delivered" })] })] }), _jsx("td", { className: "text-center", children: confirmDeleteId === order.id ? (_jsxs("div", { className: "d-flex flex-column gap-1", children: [_jsx("button", { className: "btn btn-sm btn-danger", onClick: () => deleteOrder(order.id), disabled: savingOrderId === order.id, children: "Yes, Delete" }), _jsx("button", { className: "btn btn-sm btn-secondary", onClick: () => setConfirmDeleteId(null), children: "Cancel" })] })) : (_jsx("button", { className: "btn btn-sm btn-outline-danger", onClick: () => setConfirmDeleteId(order.id), disabled: savingOrderId === order.id, onMouseEnter: (e) => {
                                                e.currentTarget.classList.remove("btn-outline-danger");
                                                e.currentTarget.classList.add("btn-danger");
                                            }, onMouseLeave: (e) => {
                                                e.currentTarget.classList.remove("btn-danger");
                                                e.currentTarget.classList.add("btn-outline-danger");
                                            }, children: "Delete" })) })] }, order.id))) })] }) }), _jsxs("div", { className: "d-flex justify-content-center gap-3 my-3", children: [_jsx("button", { className: "btn btn-primary", onClick: () => setCurrentPage((prev) => Math.max(prev - 1, 1)), disabled: currentPage === 1, children: "\u2B05\uFE0F Prev" }), _jsxs("span", { className: "align-self-center", children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { className: "btn btn-primary", onClick: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)), disabled: currentPage === totalPages, children: "Next \u27A1\uFE0F" })] })] }));
}
