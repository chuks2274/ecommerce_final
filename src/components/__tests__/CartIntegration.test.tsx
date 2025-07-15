import { render, screen, fireEvent } from "@testing-library/react"; // Import tools to render components and interact with them in tests
import { Provider } from "react-redux"; // Import Redux Provider so we can give our component access to the Redux store
import { MemoryRouter } from "react-router-dom"; // Import a fake router (MemoryRouter) so components using routes work in tests
import { store } from "../../redux/store"; // Import the app’s Redux store
import ProductCard from "../ProductCard"; // Import the ProductCard component we’re testing
import Cart from "../../pages/Cart"; // Import the Cart component so we can check if the item shows up after adding

// Define a test with a description and a function
test("Cart updates when product is added", () => {
  const product = {
    id: "1",
    title: "Test Product",
    price: 100,
    description: "Test Description",
    category: "Test Category",
    image: "test.jpg",
    rating: { rate: 4, count: 10 },
  };

    // Render the components we need, wrapped in Redux and Router context
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ProductCard
          product={product}
          onAddToCart={() => {
            store.dispatch({ type: "cart/addToCart", payload: product });
          }}
        />
        <Cart />
      </MemoryRouter>
    </Provider>
  );

  // simulate user clicking add to cart button
  fireEvent.click(screen.getByText(/Add to Cart/i));

   // Find the cart item using its test ID (e.g., data-testid="item-title-1")
  const cartItemTitle = screen.getByTestId("item-title-1");

  // Check if the item in the cart shows the correct product title
  expect(cartItemTitle).toHaveTextContent(/Test Product/i);
});