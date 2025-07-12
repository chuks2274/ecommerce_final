import { configureStore } from "@reduxjs/toolkit"; // Import function to configure the Redux store
// Import individual reducers from their slice files
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import orderReducer from "./slices/orderSlice";
import productReducer from "./slices/productSlice";
import userReducer from "./slices/userSlice";
// Create the Redux store with combined reducers
export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        order: orderReducer,
        product: productReducer,
        user: userReducer,
    },
});
