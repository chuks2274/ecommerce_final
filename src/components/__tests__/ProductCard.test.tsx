import React from "react"; // Import React library
import { render, screen, fireEvent } from "@testing-library/react"; // Import testing tools to render components and interact with them
import ProductCard from "../ProductCard"; // Import the ProductCard component to test
import { MemoryRouter } from "react-router-dom"; // Import router wrapper for testing routing-related components

// Create a fake function to replace navigation during tests
const mockedNavigate = jest.fn();

// Mock the react-router-dom module, keep all actual features except replace useNavigate with our fake function
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

// Example product object to use in tests
const sampleProduct = {
  id: "1",
  title: "Sample Product",
  image: "https://via.placeholder.com/150",
  price: 19.99,
  rating: { rate: 4.2, count: 10 },
  description: "This is a sample product description.",
  category: "electronics",
};

// Helper function to render components inside a router context for tests
const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

// Group of tests for the ProductCard component
describe("ProductCard Component", () => {
  // Test if product title and price appear on screen
  test("renders product title and price", () => {
    renderWithRouter(<ProductCard product={sampleProduct} onAddToCart={jest.fn()} />);

    // Check if the heading with the product title is in the document
    expect(screen.getByRole("heading", { name: /sample product/i })).toBeInTheDocument();

    // Check if the exact price text is shown
    expect(screen.getByText("$19.99")).toBeInTheDocument();
  });

  // Test if clicking "Add to Cart" button triggers the onAddToCart function
  test("calls onAddToCart when Add to Cart button is clicked", () => {
    const mockAddToCart = jest.fn();
    renderWithRouter(<ProductCard product={sampleProduct} onAddToCart={mockAddToCart} />);

    // Find the Add to Cart button by its accessible name
    const addButton = screen.getByRole("button", { name: /add sample product to cart/i });
    fireEvent.click(addButton);

    // Confirm the addToCart function was called once
    expect(mockAddToCart).toHaveBeenCalledTimes(1);

    // Confirm it was called with the sample product object
    expect(mockAddToCart).toHaveBeenCalledWith(sampleProduct);
  });

  // Test if clicking "View Reviews" button triggers navigation
  test("calls navigate on View Review button click", () => {
    // Pass isLoggedIn={true} so the View Review button is rendered (since it's conditionally rendered only for logged-in users)
    renderWithRouter(<ProductCard product={sampleProduct} onAddToCart={jest.fn()} isLoggedIn={true} />);

    // Find the View Reviews button by its accessible name
    const viewReviewButton = screen.getByRole("button", { name: /view reviews for sample product/i });
    fireEvent.click(viewReviewButton);

    // Confirm the mocked navigation function was called
    expect(mockedNavigate).toHaveBeenCalled();
  });
});