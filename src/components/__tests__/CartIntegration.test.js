import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime"; // These two are special helpers from React that help handle JSX when compiled (you can ignore them usually)
import { render, screen, fireEvent } from "@testing-library/react"; // Import tools to render components and simulate user interactions in tests
import { Provider } from "react-redux"; // Import Redux Provider to give components access to the store during tests
import { MemoryRouter } from "react-router-dom"; // Import MemoryRouter so we can test routing without a real browser
import { store } from "../../redux/store"; // Import Redux store for the test
import ProductCard from "../ProductCard"; // Import the ProductCard component we're testing
import Cart from "../../pages/Cart"; // Import the Cart page to see if the item shows up there

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

      // Render both ProductCard and Cart inside the Redux and Router context
    render(_jsx(Provider, { store: store, children: _jsxs(MemoryRouter, { children: [_jsx(ProductCard, { product: product, onAddToCart: () => {

          // Dispatch an action manually when the button is clicked
                        store.dispatch({ type: "cart/addToCart", payload: product });

                        // Render the cart to check if the item shows up
                    } }), _jsx(Cart, {})] }) }));

    // Simulate the user clicking the "Add to Cart" button
    fireEvent.click(screen.getByText(/Add to Cart/i));

     // Look for the product title in the Cart using a data-testid (like <p data-testid="item-title-1">)
    const cartItemTitle = screen.getByTestId("item-title-1");

     // Confirm that the title in the cart matches what we expect
    expect(cartItemTitle).toHaveTextContent(/Test Product/i);
});
