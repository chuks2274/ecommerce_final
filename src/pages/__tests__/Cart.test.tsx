import { render, screen, fireEvent } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Cart from "../Cart";

interface CartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

interface RootState {
  cart: { items: CartItem[] };
  auth: { user: { uid: string } | null };
}

// Dummy reducers without unused parameters
const dummyCartReducer = (state = { items: [] as CartItem[] }) => state;
const dummyAuthReducer = (state = { user: null as { uid: string } | null }) => state;

function renderWithStore(preloadedState: RootState) {
  const store = configureStore({
    reducer: {
      cart: dummyCartReducer,
      auth: dummyAuthReducer,
    },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    </Provider>
  );
}

const sampleItem: CartItem = {
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
    expect(
      screen.getByText("You must be logged in to place an order.")
    ).toBeInTheDocument();
  });
});