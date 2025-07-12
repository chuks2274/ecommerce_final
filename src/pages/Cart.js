import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../redux/hooks";
import { placeOrder } from "../utils/placeOrder";
import CartItemCard from "../components/CartItemCard";
import { increaseQuantity, decreaseQuantity, removeFromCart, } from "../redux/slices/cartSlice";
import "./pages.css";
export default function Cart() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const items = useAppSelector((state) => state.cart.items);
    const user = useAppSelector((state) => state.auth.user);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const handlePlaceOrderClick = () => {
        if (!user) {
            setErrorMsg("You must be logged in to place an order.");
            return;
        }
        setErrorMsg("");
        setShowConfirm(true);
    };
    const handleConfirmOrder = async () => {
        if (!user)
            return;
        setLoading(true);
        setErrorMsg("");
        try {
            await placeOrder(user.uid, items, dispatch);
            navigate("/order-success");
        }
        catch {
            setErrorMsg("Failed to place order. Please try again.");
        }
        finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };
    const handleCancelOrder = () => {
        setShowConfirm(false);
        setErrorMsg("");
    };
    const handleDecrease = (id, quantity) => {
        if (quantity > 1) {
            dispatch(decreaseQuantity(id));
        }
        else {
            dispatch(removeFromCart(id));
        }
    };
    const handleIncrease = (id) => {
        dispatch(increaseQuantity(id));
    };
    const handleRemove = (id) => {
        dispatch(removeFromCart(id));
    };
    return (_jsxs("div", { className: "container-fluid mt-4 cart-page", "data-testid": "cart-page", children: [_jsx("h2", { className: "text-center mb-4", children: "Shopping Cart" }), items.length === 0 ? (_jsxs("div", { className: "text-center", "data-testid": "empty-cart", children: [_jsx("p", { children: "Your cart is empty." }), _jsx("button", { className: "btn btn-primary mt-3", onClick: () => navigate("/"), disabled: loading, children: "Back to Home" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "cart-products-container d-flex flex-wrap gap-3 justify-content-center", "data-testid": "cart-items", children: items.map((item) => (_jsx(CartItemCard, { item: item, onDecrease: handleDecrease, onIncrease: handleIncrease, onRemove: handleRemove }, item.id))) }), _jsxs("div", { className: "text-center mt-4 cart-total mb-3", "data-testid": "cart-total", children: [_jsxs("h5", { className: "fw-bold", children: ["Total Items: ", totalItems] }), _jsxs("h4", { className: "fw-bold", children: ["Total Price: $", total.toFixed(2)] })] }), _jsxs("div", { className: "d-flex justify-content-center gap-3 flex-wrap cart-actions mb-5", children: [_jsx("button", { className: "btn btn-primary", onClick: () => navigate("/"), disabled: loading, "data-testid": "back-to-home", children: "Back to Home" }), !showConfirm ? (_jsx("button", { className: "btn btn-success", onClick: handlePlaceOrderClick, disabled: loading, "data-testid": "place-order", children: "Place Order" })) : (_jsxs("div", { className: "confirm-box d-flex gap-2 align-items-center flex-wrap", "data-testid": "confirm-box", children: [_jsx("span", { className: "fw-semibold", children: "Confirm placing order?" }), _jsx("button", { className: "btn btn-success", onClick: handleConfirmOrder, disabled: loading, "data-testid": "confirm-yes", children: loading ? "Placing..." : "Yes" }), _jsx("button", { className: "btn btn-secondary", onClick: handleCancelOrder, disabled: loading, "data-testid": "confirm-no", children: "No" })] }))] }), errorMsg && (_jsx("div", { className: "alert alert-danger text-center", role: "alert", "data-testid": "error-msg", children: errorMsg }))] }))] }));
}
