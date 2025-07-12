import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react"; // Import React hook for local component state
import { useDispatch } from "react-redux"; // Import Redux dispatch hook
import { useAppSelector } from "../redux/hooks"; // Import typed Redux selector hook
import { placeOrder } from "../utils/placeOrder"; // Import helper function to place order  
// Main CartPage component
export default function CartPage() {
    // Set up dispatch function to send actions to Redux store
    const dispatch = useDispatch();
    // Get the currently logged-in user from Redux store
    const user = useAppSelector((state) => state.auth.user);
    // Get current cart items from Redux store
    const cartItems = useAppSelector((state) => state.cart.items);
    // Local states for handling order submission status, error messages, and success feedback
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    // Calculate total cost of all items in the cart
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // Handler for submitting the order asynchronously
    const handleSubmitOrder = async () => {
        // Clear any previous messages
        setError("");
        setSuccessMessage("");
        // If user is not logged in
        if (!user?.uid) {
            setError("Please sign in to place an order.");
            return;
        }
        // If cart is empty
        if (cartItems.length === 0) {
            setError("Your cart is empty.");
            return;
        }
        // Mark as submitting
        setSubmitting(true);
        try {
            // Call helper to place the order
            await placeOrder(user.uid, cartItems, dispatch);
            // Show success message
            setSuccessMessage("Order submitted successfully!");
        }
        catch (err) {
            console.error("Error submitting order:", err);
            setError("Failed to submit order. Please try again.");
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "container mt-4 mb-5", children: [_jsx("h2", { className: "mb-4 text-center", children: "Your Cart" }), cartItems.length === 0 ? (_jsx("div", { className: "alert alert-info text-center", children: "Your cart is empty." })) : (_jsx("div", { className: "row justify-content-center", children: _jsxs("div", { className: "col-12 col-md-10 col-lg-8", children: [_jsx("ul", { className: "list-group mb-4 shadow-sm", children: cartItems.map((item) => (
                            // Loop through each cart item
                            _jsxs("li", { className: "list-group-item d-flex justify-content-between align-items-center", children: [_jsxs("div", { children: [_jsx("strong", { children: item.title }), _jsxs("div", { className: "text-muted small", children: ["Quantity: ", item.quantity] })] }), _jsxs("span", { className: "fw-semibold", children: ["$", (item.price * item.quantity).toFixed(2)] })] }, item.id))) }), _jsxs("h4", { className: "mb-3 text-end", children: ["Total: $", total.toFixed(2)] }), error && (_jsx("div", { className: "alert alert-danger text-center", role: "alert", children: error })), successMessage && (_jsx("div", { className: "alert alert-success text-center", role: "alert", children: successMessage })), _jsx("div", { className: "d-grid", children: _jsx("button", { className: "btn btn-primary btn-lg", onClick: handleSubmitOrder, disabled: submitting, children: submitting ? "Submitting..." : "Submit Order" }) })] }) }))] }));
}
