import { render, screen, fireEvent } from "@testing-library/react"; // Import testing utilities to render components and simulate events
import { configureStore } from "@reduxjs/toolkit";  // Import function to create a Redux store
import { Provider } from "react-redux"; // Import Redux provider to connect React with Redux store
import { BrowserRouter } from "react-router-dom"; // Import router to enable routing in tests
import Cart from "../Cart"; // Import the Cart component to test

// Define type for a cart item
interface CartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

// Define overall app state shape used in tests
interface RootState {
  cart: { items: CartItem[] };
  auth: { user: { uid: string } | null };
}

// Dummy reducer for cart state - just returns state as-is (no changes)
const dummyCartReducer = (state = { items: [] as CartItem[] }) => state;

// Dummy reducer for auth state - returns state as-is
const dummyAuthReducer = (state = { user: null as { uid: string } | null }) => state;

// Helper function to render the Cart component wrapped with Redux store and Router
function renderWithStore(preloadedState: RootState) {
  const store = configureStore({
    reducer: {
      cart: dummyCartReducer,
      auth: dummyAuthReducer,
    },
    preloadedState,
  });
 // Render Cart inside Provider and BrowserRouter to enable Redux and routing
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    </Provider>
  );
}
// Sample cart item to use in tests
const sampleItem: CartItem = {
  id: "1",
  title: "Test Product",
  image: "test.jpg",
  price: 25,
  quantity: 2,
};
// Group related tests for the Cart component
describe("Cart component simple tests", () => {

  // Test that Cart renders correctly with one item
  it("renders cart with one item", () => {
    renderWithStore({
      cart: { items: [sampleItem] },
      auth: { user: { uid: "abc123" } },
    });

    // Verify that the cart displays the correct product title, total item count, and total price
    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Items: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Price: \$50\.00/i)).toBeInTheDocument();
  });
  // Test that Cart shows empty message when no items
  it("renders empty cart message when no items", () => {
    renderWithStore({
      cart: { items: [] },
      auth: { user: { uid: "abc123" } },
    });
    // Check empty cart message is displayed
    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });
  // Test that an error message shows if user not logged in and tries to place order
  it("shows error if user not logged in and clicks place order", () => {
    renderWithStore({
      cart: { items: [sampleItem] },
      auth: { user: null },
    });
   // Simulate clicking the place order button
    fireEvent.click(screen.getByTestId("place-order"));

     // Check error message about login requirement is displayed
    expect(
      screen.getByText("You must be logged in to place an order.")
    ).toBeInTheDocument();
  });
});