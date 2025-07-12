import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { store } from "../../redux/store";
import ProductCard from "../ProductCard";
import Cart from "../../pages/Cart";
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
    render(_jsx(Provider, { store: store, children: _jsxs(MemoryRouter, { children: [_jsx(ProductCard, { product: product, onAddToCart: () => {
                        store.dispatch({ type: "cart/addToCart", payload: product });
                    } }), _jsx(Cart, {})] }) }));
    // simulate user clicking add to cart button
    fireEvent.click(screen.getByText(/Add to Cart/i));
    // more specific check using data-testid from Cart item
    // Assuming your Cart renders the product title with data-testid like 'item-title-1'
    const cartItemTitle = screen.getByTestId("item-title-1");
    expect(cartItemTitle).toHaveTextContent(/Test Product/i);
});
