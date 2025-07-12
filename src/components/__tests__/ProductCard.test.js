import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from "@testing-library/react";
import ProductCard from "../ProductCard";
import { MemoryRouter } from "react-router-dom";
// Mock useNavigate at top level before any tests or imports that use it
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockedNavigate,
}));
const sampleProduct = {
    id: "1",
    title: "Sample Product",
    image: "https://via.placeholder.com/150",
    price: 19.99,
    rating: { rate: 4.2, count: 10 },
    description: "This is a sample product description.",
    category: "electronics",
};
const renderWithRouter = (ui) => render(_jsx(MemoryRouter, { children: ui }));
describe("ProductCard Component", () => {
    test("renders product title and price", () => {
        renderWithRouter(_jsx(ProductCard, { product: sampleProduct, onAddToCart: jest.fn() }));
        // Check title via heading role and accessible name
        expect(screen.getByRole("heading", { name: /sample product/i })).toBeInTheDocument();
        // Check price by exact text match
        expect(screen.getByText("$19.99")).toBeInTheDocument();
    });
    test("calls onAddToCart when Add to Cart button is clicked", () => {
        const mockAddToCart = jest.fn();
        renderWithRouter(_jsx(ProductCard, { product: sampleProduct, onAddToCart: mockAddToCart }));
        const addButton = screen.getByRole("button", { name: /add sample product to cart/i });
        fireEvent.click(addButton);
        expect(mockAddToCart).toHaveBeenCalledTimes(1);
        expect(mockAddToCart).toHaveBeenCalledWith(sampleProduct);
    });
    test("calls navigate on View Review button click", () => {
        renderWithRouter(_jsx(ProductCard, { product: sampleProduct, onAddToCart: jest.fn() }));
        const viewReviewButton = screen.getByRole("button", { name: /view reviews for sample product/i });
        fireEvent.click(viewReviewButton);
        expect(mockedNavigate).toHaveBeenCalled();
    });
});
