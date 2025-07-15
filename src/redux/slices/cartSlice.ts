import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"; // Import functions from Redux Toolkit to create slice, async actions, and define action types
import { doc, setDoc, getDoc } from "firebase/firestore"; // Import Firestore functions for reading and writing documents
import { db } from "../../firebase/firebase"; // Import the Firebase Firestore instance

// Define the shape of a single cart item
export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
  rating?: number;
}
// Define the shape of the cart slice state
interface CartState {
  items: CartItem[];
  status: "idle" | "loading" | "failed";
  error: string | null;
}
// Initial state of the cart
const initialState: CartState = {
  items: [],
  status: "idle",
  error: null,
};

// Fetch cart from Firestore for a given user
export const fetchCart = createAsyncThunk<CartItem[], string>(
  "cart/fetchCart",
  async (userId, { rejectWithValue }) => {
    try {
      // Get document reference for user cart
      const cartRef = doc(db, "carts", userId);
      // Try to fetch the document
      const snapshot = await getDoc(cartRef);
      if (snapshot.exists()) {
         // Return cart items if found
        return snapshot.data().items as CartItem[];
      }
      return [];
    } catch {
      return rejectWithValue("Failed to fetch cart");
    }
  }
);

// Save cart to Firestore for a given user
export const saveCart = createAsyncThunk<
  CartItem[],
  { userId: string; items: CartItem[] }
>(
  "cart/saveCart",
  async ({ userId, items }, { rejectWithValue }) => {
    try {
      if (!userId) throw new Error("No user ID provided");
      // Get document reference for user cart
      const cartRef = doc(db, "carts", userId);
      // Save items to Firestore
      await setDoc(cartRef, { items });
      return items; // Return saved items
    } catch {
      return rejectWithValue("Failed to save cart");
    }
  }
);
// Create a Redux slice for cart
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Set cart items directly (used to replace entire cart)
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
    // Add item to cart, or increase quantity if it already exists
    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    // Increase quantity of a cart item by 1
    increaseQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.quantity++;
    },
    // Decrease quantity of a cart item by 1 (but not below 1)
    decreaseQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.quantity > 1) item.quantity--;
    },
    // Remove an item completely from the cart
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
     // Clear all items from the cart
    clearCart(state) {
      state.items = [];
    },
  },
  // Handle extra reducers for async actions
  extraReducers: (builder) => {
    builder
    // When fetchCart starts
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      // When fetchCart succeeds
      .addCase(fetchCart.fulfilled, (state, action) => {
        const isDifferent =
          JSON.stringify(state.items) !== JSON.stringify(action.payload);
        if (isDifferent) {
           // Update cart if data has changed
          state.items = action.payload;
        }
        state.status = "idle";
      })
      // When fetchCart fails
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // When saveCart starts
      .addCase(saveCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
       // When saveCart succeeds
      .addCase(saveCart.fulfilled, (state, action) => {
        const isDifferent =
          JSON.stringify(state.items) !== JSON.stringify(action.payload);
        if (isDifferent) {
          // Update cart if saved data is different
          state.items = action.payload;
        }
        state.status = "idle";
      })
       // When saveCart fails
      .addCase(saveCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});
// Export actions so they can be used in components
export const {
  setCartItems,
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;
// Export reducer so it can be added to the Redux store
export default cartSlice.reducer;