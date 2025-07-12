import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react"; // React hooks to manage side effects and component state
import { useNavigate, useParams } from "react-router-dom"; // React Router hooks for navigation and reading route parameters
import { doc, getDoc, deleteDoc, Timestamp, } from "firebase/firestore"; // Firestore functions to read and delete data, and type support
import { db } from "../firebase/firebase"; // Import Firestore database from your Firebase config
import { useAuth } from "../hooks/useAuth"; // Custom hook to get the currently logged-in user
// Components for displaying and submitting product reviews
import { ProductReviewsList } from "../components/ProductReviewsList";
import { ProductReviewForm } from "../components/ProductReviewForm";
// Main component to show order details
export default function OrderDetail() {
    // Get the order ID from the URL (e.g. /orders/:orderId)
    const { orderId } = useParams();
    // Function to programmatically navigate to another page
    const navigate = useNavigate();
    // Get the logged-in user
    const { currentUser } = useAuth();
    // Local state for order data, loading/error messages, delete status, confirmation, and review visibility
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [deleteStatus, setDeleteStatus] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [reviewsVisible, setReviewsVisible] = useState({});
    // Fetch the order when the component loads or orderId changes
    useEffect(() => {
        // If no orderId in the URL, show error
        if (!orderId) {
            setError("No order ID provided.");
            setLoading(false);
            return;
        }
        // Async function to load order data
        async function fetchOrder() {
            setLoading(true);
            setError("");
            try {
                // Reference to the specific order document
                const orderDocRef = doc(db, "orders", orderId);
                // Get the document data
                const docSnap = await getDoc(orderDocRef);
                // If order is found
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Convert Firestore timestamp to JS Date
                    let createdAtDate = null;
                    if (data.createdAt && data.createdAt instanceof Timestamp) {
                        createdAtDate = data.createdAt.toDate();
                    }
                    // Normalize items array to fill missing fields with defaults
                    const normalizedItems = (data.items ?? []).map((item) => ({
                        id: item.id || item.productId || "",
                        title: item.title || "",
                        price: item.price || 0,
                        image: item.image || "",
                        quantity: item.quantity || 0,
                        productId: item.productId,
                    }));
                    // Save order to state
                    setOrder({
                        id: orderId,
                        userId: data.userId,
                        items: normalizedItems,
                        status: data.status || "",
                        total: data.total || 0,
                        createdAt: createdAtDate,
                    });
                }
                else {
                    setError("Order not found.");
                }
            }
            catch (err) {
                setError("Failed to load order.");
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        }
        fetchOrder(); // Call the async function
    }, [orderId]); // Run when orderId changes
    // Show or hide reviews for a specific product
    const toggleReviews = (productId) => {
        setReviewsVisible((prev) => ({
            ...prev,
            [productId]: !prev[productId], // Toggle true/false
        }));
    };
    // Delete the current order
    const handleDelete = async () => {
        if (!orderId)
            return;
        try {
            // Delete order from Firestore
            await deleteDoc(doc(db, "orders", orderId));
            setSuccessMessage("Order deleted successfully.");
            setDeleteStatus(true);
            // Wait 2 seconds before navigating back
            setTimeout(() => {
                navigate("/orders");
            }, 2000);
        }
        catch (err) {
            setError("Failed to delete order.");
            console.error(err);
        }
    };
    // If the page is still loading, show a loading message
    if (loading)
        return _jsx("p", { children: "Loading order details..." });
    // If there's an error, show the error and back button
    if (error)
        return (_jsxs("div", { children: [_jsx("p", { className: "text-danger", children: error }), _jsx("button", { className: "btn btn-primary", onClick: () => navigate(-1), children: "Back to Orders" })] }));
    // If no order data exists, show a message
    if (!order)
        return _jsx("p", { children: "No order details to display." });
    return (_jsxs("div", { className: "container mt-4", children: [_jsx("h2", { children: "Order Details" }), _jsxs("p", { children: [_jsx("strong", { children: "Order ID:" }), " ", order.id] }), _jsxs("p", { children: [_jsx("strong", { children: "Status:" }), " ", order.status] }), _jsxs("p", { children: [_jsx("strong", { children: "Total:" }), " $", order.total.toFixed(2)] }), order.createdAt && (_jsxs("p", { children: [_jsx("strong", { children: "Placed on:" }), " ", order.createdAt.toLocaleString()] })), _jsxs("table", { className: "table compact-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Image" }), _jsx("th", { children: "Title" }), _jsx("th", { children: "Price \u00D7 Qty" }), _jsx("th", { children: "Reviews" })] }) }), _jsx("tbody", { children: order.items.length === 0 ? (
                        // If there are no items in the order
                        _jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-muted text-center", children: "No items found in this order." }) })) : (
                        // Loop through all items in the order
                        order.items.map((item, idx) => {
                            const productId = item.id || item.productId || "";
                            const showReviews = reviewsVisible[productId] || false;
                            return (_jsxs("tr", { children: [_jsx("td", { children: _jsx("img", { src: item.image, alt: item.title, className: "img-thumbnail", style: { width: 40, height: 40, objectFit: "contain" } }) }), _jsx("td", { children: item.title }), _jsxs("td", { children: ["$", item.price.toFixed(2), " \u00D7 ", item.quantity] }), _jsx("td", { children: currentUser && productId ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: "btn btn-sm btn-outline-primary", onClick: () => toggleReviews(productId), children: showReviews ? "Hide Reviews" : "Show Reviews" }), showReviews && (_jsxs("div", { className: "mt-2", children: [_jsx(ProductReviewForm, { userId: currentUser.uid, productId: productId }), _jsx(ProductReviewsList, { productId: productId, userId: currentUser.uid })] }))] })) : (_jsx("p", { children: "Please log in to add a review." })) })] }, productId || idx));
                        })) })] }), successMessage && (_jsx("div", { className: "alert alert-success text-center", children: successMessage })), error && _jsx("div", { className: "alert alert-danger text-center", children: error }), _jsxs("div", { className: "d-flex justify-content-between align-items-start mt-4", children: [!deleteStatus && !confirmDelete && (_jsx("button", { className: "btn btn-primary", onClick: () => navigate(-1), children: "Back to Orders" })), !deleteStatus &&
                        order &&
                        (!confirmDelete ? (
                        // First step: show delete button
                        _jsx("button", { className: "btn btn-danger", onClick: () => setConfirmDelete(true), children: "Delete Order" })) : (
                        // Second step: confirm delete
                        _jsxs("div", { className: "text-end ms-auto", children: [_jsx("p", { className: "text-danger mb-2", children: "Are you sure you want to delete this order?" }), _jsxs("div", { className: "d-flex gap-2 justify-content-end", children: [_jsx("button", { className: "btn btn-danger", onClick: handleDelete, children: "Yes, Delete" }), _jsx("button", { className: "btn btn-secondary", onClick: () => setConfirmDelete(false), children: "Cancel" })] })] })))] })] }));
}
