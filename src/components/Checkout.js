import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo, useState } from "react"; // React hooks: useCallback for memoizing functions, useMemo for memoizing values, useState for local state
import { useDispatch, useSelector } from "react-redux"; // Import Hooks to get Redux dispatch function and read Redux state
import { useNavigate } from "react-router-dom"; // Hook to navigate (redirect) users between routes/pages
import { placeOrder } from "../utils/placeOrder"; // Import reusable placeOrder function that handles order logic and Firestore
// React functional component for the checkout page
export default function Checkout() {
    // Get Redux dispatch to send actions
    const dispatch = useDispatch();
    // Setup navigation function for redirecting users
    const navigate = useNavigate();
    // Get the logged-in user info from Redux store
    const { user } = useSelector((state) => state.auth);
    // Get the current items in the shopping cart from Redux store
    const cartItems = useSelector((state) => state.cart.items);
    // Local states to manage loading spinner, success message, and error message during order placement
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    // Calculate total price of all cart items, only recomputes when cartItems change
    const total = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
    // Function to handle placing the order, memoized to avoid unnecessary re-creation
    const placeOrderHandler = useCallback(async () => {
        // Clear any old success or error messages
        setSuccessMessage(null);
        setErrorMessage(null);
        // Show error if user is not logged in
        if (!user) {
            setErrorMessage("⚠️ Please login to place an order.");
            return;
        }
        // Show error if cart has no items
        if (cartItems.length === 0) {
            setErrorMessage("🛒 Your cart is empty.");
            return;
        }
        setLoading(true);
        try {
            // Call the shared placeOrder function to create order and send notifications
            await placeOrder(user.uid, cartItems, dispatch);
            setSuccessMessage("✅ Order placed successfully!");
            navigate("/orders");
        }
        catch (error) {
            console.error("Failed to place order:", error);
            setErrorMessage("❌ Failed to place order. Please try again.");
        }
        finally {
            setLoading(false);
        }
    }, [user, cartItems, dispatch, navigate]);
    return (_jsxs("div", { className: "container mt-4", children: [_jsx("h2", { className: "mb-3", children: "Checkout" }), _jsxs("div", { className: "border rounded p-3 shadow-sm bg-white", children: [_jsxs("p", { className: "mb-2 fs-5", children: [_jsx("strong", { children: "Total:" }), " $", total.toFixed(2)] }), _jsx("button", { className: "btn btn-primary", onClick: placeOrderHandler, disabled: loading || !user || cartItems.length === 0, title: !user
                            ? "Please sign in to place an order."
                            : cartItems.length === 0
                                ? "Your cart is empty."
                                : "", children: loading ? "Placing Order..." : "Place Order" }), successMessage && (_jsx("div", { className: "alert alert-success mt-3", role: "alert", children: successMessage })), errorMessage && (_jsx("div", { className: "alert alert-danger mt-3", role: "alert", children: errorMessage }))] })] }));
}
