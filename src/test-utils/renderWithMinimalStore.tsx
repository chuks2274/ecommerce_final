import React, { PropsWithChildren } from "react"; // Import React and types for children props
import {
  configureStore,
  createSlice,
  PayloadAction,
  combineReducers,
} from "@reduxjs/toolkit"; // Import Redux Toolkit helpers
import { Provider } from "react-redux"; // Import React-Redux provider to give store to app
import { render } from "@testing-library/react";  // Import testing library render function
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux"; // Import typed Redux hooks for dispatch and selector

// Redux test utilities: minimal slices, store, typed hooks, and render helper for testing

// Define the structure of a cart item
interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

// Define the structure of a user object
interface User {
  uid: string;
  email?: string;
}

// Initial state for the cart slice with an empty items array
const cartInitialState = {
  items: [] as CartItem[], // Cart starts empty
};

// Create the cart slice with reducers to manage cart state and items
const cartSlice = createSlice({
  name: "cart",
  initialState: cartInitialState,
  reducers: {
    // Remove an item from the cart by filtering out the item with the given id
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    // Increase the quantity of a cart item by 1 if it exists
    increaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.quantity += 1;
    },
    // Decrease the quantity of a cart item by 1 if quantity is greater than 1
    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
    },
  },
});

// Initial state for the authentication slice
const authInitialState = {
  user: null as User | null,
  loading: false,
  error: null as string | null,
};


// Create auth slice with reducers to manage user authentication state
const authSlice = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers: {
    // Set or clear the authenticated user in state
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
});

// Combine cart and auth reducers into a single root reducer
const rootReducer = combineReducers({
  cart: cartSlice.reducer,
  auth: authSlice.reducer,
});
// Define the RootState type based on the combined root reducer
export type RootState = ReturnType<typeof rootReducer>;

// Configure Redux store, allowing optional preloaded state for testing or persistence
export const configureAppStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: {
      // Merge initial state with any preloaded state for cart and auth slices
      cart: {
        ...cartInitialState,
        ...(preloadedState?.cart || {}),
      },
      auth: {
        ...authInitialState,
        ...(preloadedState?.auth || {}),
      },
    },
  });
 // Type representing the configured Redux store instance
export type AppStore = ReturnType<typeof configureAppStore>;

// Type representing the Redux store’s dispatch function
export type AppDispatch = AppStore["dispatch"];

// Typed hook to get the dispatch function with AppDispatch type
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Typed hook to select state slices with RootState type
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Helper function to render React components wrapped with Redux Provider and store, useful for testing
export function renderWithMinimalStore(
  ui: React.ReactElement,
  {
    preloadedState,
    store = configureAppStore(preloadedState),
    ...renderOptions
  }: {
    preloadedState?: Partial<RootState>;
    store?: AppStore;
  } = {}
) {
  // Wraps children components with Redux Provider supplying the store
  function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  }
 // Render UI component with Redux wrapper and additional options
  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result, // Return all render results
    store,  // Include store instance for test access
  };
}