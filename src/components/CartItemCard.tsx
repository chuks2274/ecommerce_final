import React from "react";  // Import React so we can use JSX and create components

// Define the shape of a CartItem object
interface CartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

// Define the props expected by CartItemCard component
interface CartItemCardProps {
  item: CartItem;
  onDecrease: (id: string, quantity: number) => void;
  onIncrease: (id: string) => void;
  onRemove: (id: string) => void;
}
// Create the CartItemCard component
const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onDecrease,
  onIncrease,
  onRemove,
}) => {
  // Outer wrapper for the item card
  return (
    <div
      data-testid={`cart-item-${item.id}`}
      className="product-card-wrapper"
      style={{
        flex: "0 0 auto",
        maxWidth: "280px",
        width: "100%",
      }}
    >
      <div className="card h-100 shadow-sm product-card">
        {/* Product image - fix height/width to prevent layout shift */}
        <div
          className="card-img-top p-3 d-flex align-items-center justify-content-center"
          style={{
            height: "180px",
            minHeight: "180px",
            overflow: "hidden",
            backgroundColor: "#f8f9fa",
          }}
        >
           {/* Product image */}
          <img
            src={item.image}
            alt={item.title}
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        <div className="card-body d-flex flex-column">
          <h5 className="card-title" data-testid={`item-title-${item.id}`}>
            {item.title}
          </h5>

          <p
            className="card-text fw-bold text-primary"
            data-testid={`item-price-${item.id}`}
          >
            ${item.price.toFixed(2)}
          </p>
            {/* Quantity controls and remove button at the bottom of the card */}
          <div className="d-flex align-items-center justify-content-between mt-auto">
            <div className="btn-group" role="group">
              <button
                className="btn btn-sm btn-outline-primary square-btn"
                onClick={() => onDecrease(item.id, item.quantity)}
                data-testid={`decrease-${item.id}`}
              >
                −
              </button>
              <span
                className="px-2 align-self-center"
                data-testid={`quantity-${item.id}`}
              >
                {item.quantity}
              </span>
              <button
                className="btn btn-sm btn-outline-primary square-btn"
                onClick={() => onIncrease(item.id)}
                data-testid={`increase-${item.id}`}
              >
                +
              </button>
            </div>

            <button
              className="btn btn-danger btn-sm"
              onClick={() => onRemove(item.id)}
              data-testid={`remove-${item.id}`}
            >
              Remove
            </button>
          </div>

          <p
            className="mt-2 text-end fw-semibold"
            data-testid={`item-total-${item.id}`}
          >
            Total: ${(item.price * item.quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};
// Export the CartItemCard component so it can be used in other files
export default CartItemCard;