import { useEffect, useRef } from "react"; // Import React hooks: useEffect for side effects, useRef to store mutable value
import { useAppSelector } from "../redux/hooks"; // Import hook to read Redux state with types
import { useDispatch } from "react-redux"; // Import hook to dispatch Redux actions
import { saveCart } from "../redux/slices/cartSlice"; // Import action to save cart data
import type { AppDispatch } from "../redux/store"; // Import type for dispatch function with thunk support

// Define a component that automatically saves the user's cart to the backend when it changes
const CartAutoSave = () => {

  // Create a dispatch function to send acyions to the Redux store
  const dispatch = useDispatch<AppDispatch>();

  // Get current logged-in user's ID from Redux state
  const userId = useAppSelector((state) => state.auth.user?.uid);

  // Get current cart items from Redux state
  const cartItems = useAppSelector((state) => state.cart.items);

  // Store timeout ID for debouncing save requests
  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    // If user is not logged in, do nothing
    if (!userId) return;
    
     // If a save timeout already exists, clear it to reset debounce timer
    if (debounceTimeout.current !== null) {
      window.clearTimeout(debounceTimeout.current);
    }
    // Set a new timeout to save the cart after 500ms of no changes
    debounceTimeout.current = window.setTimeout(() => {

      // Dispatch saveCart action with user ID and current cart items
      dispatch(saveCart({ userId, items: cartItems }));
    }, 500);  
     // Cleanup function runs before next effect or unmount
    return () => {
      // Clear the timeout if it exists to avoid multiple saves
      if (debounceTimeout.current !== null) {
        window.clearTimeout(debounceTimeout.current);
      }
    };
  }, [cartItems, userId, dispatch]);  // Run when cart items, user ID, or dispatch change

  return null;
};

export default CartAutoSave; // Export component for use elsewhere