import { useState, useEffect } from "react"; // Import React hooks for local state and side effects
import { useNavigate } from "react-router-dom"; // Import navigation hook from React Router
import { useDispatch } from "react-redux"; // Import Redux hook to dispatch actions
import { useAppSelector } from "../redux/hooks"; // Import typed selector hook to get data from the Redux store
import { placeOrder } from "../utils/placeOrder"; // Import the function that sends the order to the database
import { AppDispatch } from "../redux/store"; // Import the app's dispatch type for better TypeScript support
import CartItemCard from "../components/CartItemCard"; // Import the component that displays each cart item
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
} from "../redux/slices/cartSlice"; // Import Redux actions for cart item management
import { saveCartToFirestore } from "../firebase/services/cartService"; // Import function to save the cart to Firestore
import "./pages.css"; // Import custom CSS for page styling

// Main component that renders the shopping cart page
export default function Cart() {

  // Hook to programmatically navigate to another page
  const navigate = useNavigate();
  
  // Create a dispatch function to send actions to the Redux store
  const dispatch = useDispatch<AppDispatch>();
 
   // Get the currently logged-in user from Redux store
  const user = useAppSelector((state) => state.auth.user);
    
   // Get the list of items in the cart from Redux store
  const items = useAppSelector((state) => state.cart.items);

  // Save cart to Firestore whenever cart or user changes
  useEffect(() => {
    if (user) {
      saveCartToFirestore(user.uid, items);
    }
  }, [items, user]);  // Run when cart items or user changes

   // Local states for confirm box, loading spinner, and error message
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Calculate total number of items in the cart
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total price for all items in the cart
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Handle the click on "Place Order" button
  const handlePlaceOrderClick = () => {
    if (!user) {
      setErrorMsg("You must be logged in to place an order.");
      return;
    }
     // Clear error and show confirmation box
    setErrorMsg("");
    setShowConfirm(true);
  };
 // Handle the "Yes" button when user confirms order
  const handleConfirmOrder = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg("");
    try {
      // Try placing the order in Firestore
      await placeOrder(user.uid, items, dispatch);
      navigate("/order-success");
    } catch {
      setErrorMsg("Failed to place order. Please try again.");
    } finally {
       // Always stop loading and hide confirmation box
      setLoading(false);
      setShowConfirm(false);
    }
  };
  // Handle the "No" button to cancel confirmation
  const handleCancelOrder = () => {
    setShowConfirm(false);
    setErrorMsg("");
  };
    // Handle clicking "-" button on a cart item
  const handleDecrease = (id: string, quantity: number) => {
    if (quantity > 1) {
      dispatch(decreaseQuantity(id));
    } else {
      // If quantity is 1, remove the item completely
      dispatch(removeFromCart(id));
    }
  };
  // Handle clicking "+" button on a cart item
  const handleIncrease = (id: string) => {
    dispatch(increaseQuantity(id));
  };
   // Handle clicking "remove" button on a cart item
  const handleRemove = (id: string) => {
    dispatch(removeFromCart(id));
  };

  return (
    <div className="container-fluid mt-4 cart-page" data-testid="cart-page">
      <h2 className="text-center mb-4">Shopping Cart</h2>
      {/* If cart is empty, show this message */}
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
        {/* Show list of cart items using CartItemCard */}
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
           {/* Buttons to go back or place order */}
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
           {/* Show error message if any */}
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