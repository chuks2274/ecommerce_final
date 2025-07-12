import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Cart from "../Cart";
// Dummy reducers without unused parameters
const dummyCartReducer = (state = { items: [] }) => state;
const dummyAuthReducer = (state = { user: null }) => state;
function renderWithStore(preloadedState) {
    const store = configureStore({
        reducer: {
            cart: dummyCartReducer,
            auth: dummyAuthReducer,
        },
        preloadedState,
    });
    return render(_jsx(Provider, { store: store, children: _jsx(BrowserRouter, { children: _jsx(Cart, {}) }) }));
}
const sampleItem = {
    id: "1",
    title: "Test Product",
    image: "test.jpg",
    price: 25,
    quantity: 2,
};
describe("Cart component simple tests", () => {
    it("renders cart with one item", () => {
        renderWithStore({
            cart: { items: [sampleItem] },
            auth: { user: { uid: "abc123" } },
        });
        // Use regex matchers to avoid exact text matching issues
        expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
        expect(screen.getByText(/Total Items: 2/i)).toBeInTheDocument();
        expect(screen.getByText(/Total Price: \$50\.00/i)).toBeInTheDocument();
    });
    it("renders empty cart message when no items", () => {
        renderWithStore({
            cart: { items: [] },
            auth: { user: { uid: "abc123" } },
        });
        expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
    });
    it("shows error if user not logged in and clicks place order", () => {
        renderWithStore({
            cart: { items: [sampleItem] },
            auth: { user: null },
        });
        fireEvent.click(screen.getByTestId("place-order"));
        expect(screen.getByText("You must be logged in to place an order.")).toBeInTheDocument();
    });
});
