import { combineReducers } from "@reduxjs/toolkit"; // Import combineReducers function from Redux Toolkit to combine multiple reducers
import cartReducer from "./slices/cartSlice"; // Import the cart slice reducer
import authReducer from "./slices/authSlice"; // Import the auth slice reducer

// Combine the cart and auth reducers into one root reducer
const rootReducer = combineReducers({
  cart: cartReducer,
  auth: authReducer,
});

// Define a TypeScript type for the overall state shape using the rootReducer
export type RootState = ReturnType<typeof rootReducer>;

// Export the root reducer so it can be used to configure the Redux store
export default rootReducer;