import { render, screen, fireEvent } from "@testing-library/react"; // Import functions for rendering the component and interacting with the DOM
import CartItemCard from "../CartItemCard"; // Import the CartItemCard component to be tested

// A sample product item used in all the tests below
const mockItem = {
  id: "1",
  title: "Test Product",
  image: "https://via.placeholder.com/150",
  price: 20,
  quantity: 2,
};

// Start the group of tests for the CartItemCard component
describe("CartItemCard", () => {

   // This test checks if the component correctly shows product details
  it("renders item details correctly", () => {
    render(
      <CartItemCard
        item={mockItem}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
        onRemove={jest.fn()}
      />
    );
 // Ensure that the product's title, price, quantity, and total are correctly displayed in the cart item
    expect(screen.getByTestId("item-title-1")).toHaveTextContent("Test Product");
    expect(screen.getByTestId("item-price-1")).toHaveTextContent("$20.00");
    expect(screen.getByTestId("quantity-1")).toHaveTextContent("2");
    expect(screen.getByTestId("item-total-1")).toHaveTextContent("Total: $40.00");
  });

    // This test checks if the callback functions are triggered when buttons are clicked
  it("calls callbacks when buttons are clicked", () => {
    const onDecrease = jest.fn();
    const onIncrease = jest.fn();
    const onRemove = jest.fn();

    render(
      <CartItemCard
        item={mockItem}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
        onRemove={onRemove}
      />
    );
 // Simulate clicking decrease, increase, and remove buttons and verify the correct callback functions are called with expected arguments
    fireEvent.click(screen.getByTestId("decrease-1"));
    fireEvent.click(screen.getByTestId("increase-1"));
    fireEvent.click(screen.getByTestId("remove-1"));

    expect(onDecrease).toHaveBeenCalledWith("1", 2);
    expect(onIncrease).toHaveBeenCalledWith("1");
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});