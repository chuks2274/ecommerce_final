import React, { PropsWithChildren } from "react";
import {
  configureStore,
  createSlice,
  PayloadAction,
  combineReducers,
} from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";

// Types
interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface User {
  uid: string;
  email?: string;
}

// Cart Slice
const cartInitialState = {
  items: [] as CartItem[],
};

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

// Auth Slice
const authInitialState = {
  user: null as User | null,
  loading: false,
  error: null as string | null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
});

// Combine Reducers
const rootReducer = combineReducers({
  cart: cartSlice.reducer,
  auth: authSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// Configure store
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

export type AppStore = ReturnType<typeof configureAppStore>;
export type AppDispatch = AppStore["dispatch"];

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Render util
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
  function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  }

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result,
    store,
  };
}