import React from "react";

interface CartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

interface CartItemCardProps {
  item: CartItem;
  onDecrease: (id: string, quantity: number) => void;
  onIncrease: (id: string) => void;
  onRemove: (id: string) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onDecrease,
  onIncrease,
  onRemove,
}) => {
  return (
    <div
      data-testid={`cart-item-${item.id}`}
      className="product-card-wrapper"
      style={{ flex: "0 0 auto", maxWidth: "280px", width: "100%" }}
    >
      <div className="card h-100 shadow-sm product-card">
        <img
          src={item.image}
          alt={item.title}
          className="card-img-top p-3"
          style={{ height: "180px", objectFit: "contain" }}
        />
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

export default CartItemCard;