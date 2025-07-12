import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../redux/hooks";
import { placeOrder } from "../utils/placeOrder";
import { AppDispatch } from "../redux/store";
import CartItemCard from "../components/CartItemCard";

import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from "../redux/slices/cartSlice";

import "./pages.css";

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

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
    if (!user) return;

    setLoading(true);
    setErrorMsg("");

    try {
      await placeOrder(user.uid, items, dispatch);
      navigate("/order-success");
    } catch {
      setErrorMsg("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handleCancelOrder = () => {
    setShowConfirm(false);
    setErrorMsg("");
  };

  const handleDecrease = (id: string, quantity: number) => {
    if (quantity > 1) {
      dispatch(decreaseQuantity(id));
    } else {
      dispatch(removeFromCart(id));
    }
  };

  const handleIncrease = (id: string) => {
    dispatch(increaseQuantity(id));
  };

  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
  };

  return (
    <div className="container-fluid mt-4 cart-page" data-testid="cart-page">
      <h2 className="text-center mb-4">Shopping Cart</h2>

      {items.length === 0 ? (
        <div className="text-center" data-testid="empty-cart">
          <p>Your cart is empty.</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/")}
            disabled={loading}
          >
            Back to Home
          </button>
        </div>
      ) : (
        <>
          <div
            className="cart-products-container d-flex flex-wrap gap-3 justify-content-center"
            data-testid="cart-items"
          >
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onDecrease={handleDecrease}
                onIncrease={handleIncrease}
                onRemove={handleRemove}
              />
            ))}
          </div>

          <div
            className="text-center mt-4 cart-total mb-3"
            data-testid="cart-total"
          >
            <h5 className="fw-bold">Total Items: {totalItems}</h5>
            <h4 className="fw-bold">Total Price: ${total.toFixed(2)}</h4>
          </div>

          <div className="d-flex justify-content-center gap-3 flex-wrap cart-actions mb-5">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/")}
              disabled={loading}
              data-testid="back-to-home"
            >
              Back to Home
            </button>

            {!showConfirm ? (
              <button
                className="btn btn-success"
                onClick={handlePlaceOrderClick}
                disabled={loading}
                data-testid="place-order"
              >
                Place Order
              </button>
            ) : (
              <div
                className="confirm-box d-flex gap-2 align-items-center flex-wrap"
                data-testid="confirm-box"
              >
                <span className="fw-semibold">Confirm placing order?</span>
                <button
                  className="btn btn-success"
                  onClick={handleConfirmOrder}
                  disabled={loading}
                  data-testid="confirm-yes"
                >
                  {loading ? "Placing..." : "Yes"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelOrder}
                  disabled={loading}
                  data-testid="confirm-no"
                >
                  No
                </button>
              </div>
            )}
          </div>

          {errorMsg && (
            <div
              className="alert alert-danger text-center"
              role="alert"
              data-testid="error-msg"
            >
              {errorMsg}
            </div>
          )}
        </>
      )}
    </div>
  );
}