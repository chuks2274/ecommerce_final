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

// Define the shape of a cart item
interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

// Define the shape of a user object
interface User {
  uid: string;
  email?: string;
}

// Initial state for the cart slice
const cartInitialState = {
  items: [] as CartItem[], // Cart starts empty
};

// Create the cart slice with reducers to manage cart items
const cartSlice = createSlice({
  name: "cart",
  initialState: cartInitialState,
  reducers: {
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    increaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.quantity += 1;
    },
    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
    },
  },
});

// Initial state for authentication slice
const authInitialState = {
  user: null as User | null,
  loading: false,
  error: null as string | null,
};


// Create auth slice with reducer to set user info
const authSlice = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
});

// Combine cart and auth reducers into one root reducer
const rootReducer = combineReducers({
  cart: cartSlice.reducer,
  auth: authSlice.reducer,
});
// Define the RootState type from the root reducer output
export type RootState = ReturnType<typeof rootReducer>;

// Configure Redux store with optional initial state for testing or persistence
export const configureAppStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: {
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
 // Types for store and dispatch, used for typing Redux hooks
export type AppStore = ReturnType<typeof configureAppStore>;
export type AppDispatch = AppStore["dispatch"];

// Typed hook to get typed dispatch function
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Typed hook to select typed state slices
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Helper function to render React components with Redux provider and store, useful for tests
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
  // Wrapper component to provide Redux store to children
  function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  }
 // Render UI with wrapper and other options
  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result, // Return render results 
    store, // Return store instance for access in tests
  };
}