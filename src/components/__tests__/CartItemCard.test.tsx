import { render, screen, fireEvent } from "@testing-library/react";
import CartItemCard from "../CartItemCard";

const mockItem = {
  id: "1",
  title: "Test Product",
  image: "https://via.placeholder.com/150",
  price: 20,
  quantity: 2,
};

describe("CartItemCard", () => {
  it("renders item details correctly", () => {
    render(
      <CartItemCard
        item={mockItem}
        onDecrease={jest.fn()}
        onIncrease={jest.fn()}
        onRemove={jest.fn()}
      />
    );

    expect(screen.getByTestId("item-title-1")).toHaveTextContent("Test Product");
    expect(screen.getByTestId("item-price-1")).toHaveTextContent("$20.00");
    expect(screen.getByTestId("quantity-1")).toHaveTextContent("2");
    expect(screen.getByTestId("item-total-1")).toHaveTextContent("Total: $40.00");
  });

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

    fireEvent.click(screen.getByTestId("decrease-1"));
    fireEvent.click(screen.getByTestId("increase-1"));
    fireEvent.click(screen.getByTestId("remove-1"));

    expect(onDecrease).toHaveBeenCalledWith("1", 2);
    expect(onIncrease).toHaveBeenCalledWith("1");
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});