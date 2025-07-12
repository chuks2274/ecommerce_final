import { jsx as _jsx } from "react/jsx-runtime";
import { configureStore, createSlice, combineReducers, } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import { useDispatch, useSelector, } from "react-redux";
// Cart Slice
const cartInitialState = {
    items: [],
};
const cartSlice = createSlice({
    name: "cart",
    initialState: cartInitialState,
    reducers: {
        removeFromCart: (state, action) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },
        increaseQuantity: (state, action) => {
            const item = state.items.find((i) => i.id === action.payload);
            if (item)
                item.quantity += 1;
        },
        decreaseQuantity: (state, action) => {
            const item = state.items.find((i) => i.id === action.payload);
            if (item && item.quantity > 1)
                item.quantity -= 1;
        },
    },
});
// Auth Slice
const authInitialState = {
    user: null,
    loading: false,
    error: null,
};
const authSlice = createSlice({
    name: "auth",
    initialState: authInitialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
    },
});
// Combine Reducers
const rootReducer = combineReducers({
    cart: cartSlice.reducer,
    auth: authSlice.reducer,
});
// Configure store
export const configureAppStore = (preloadedState) => configureStore({
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
// Typed hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
// Render util
export function renderWithMinimalStore(ui, { preloadedState, store = configureAppStore(preloadedState), ...renderOptions } = {}) {
    function Wrapper({ children }) {
        return _jsx(Provider, { store: store, children: children });
    }
    const result = render(ui, { wrapper: Wrapper, ...renderOptions });
    return {
        ...result,
        store,
    };
}
