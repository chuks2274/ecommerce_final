import { useCallback, useMemo } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import type { Product } from "../types";
import { useNavigate } from "react-router-dom";
import "./components.css";

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
  disabled?: boolean;
}

const capitalizeCategory = (category: string) =>
  category.charAt(0).toUpperCase() + category.slice(1);

export default function ProductCard({ product, onAddToCart, disabled = false }: Props) {
  const navigate = useNavigate();

  const {
    id = "",
    title = "No title",
    image = "",
    price = 0,
    rating = { rate: 0, count: 0 },
    description = "",
    category = "",
  } = product || {};

  const stars = useMemo(() => {
    const filledStars = Math.round(rating?.rate || 0);
    return Array(5)
      .fill(0)
      .map((_, i) =>
        i < filledStars ? (
          <FaStar key={i} className="text-warning me-1" aria-label="Filled star" />
        ) : (
          <FaRegStar key={i} className="text-warning me-1" aria-label="Empty star" />
        )
      );
  }, [rating?.rate]);

  const handleViewReviews = useCallback(() => {
    if (!id) return;
    navigate(`/reviews/${id}`);
  }, [id, navigate]);

  const handleAddToCart = useCallback(() => {
    if (disabled || !product) return;
    try {
      onAddToCart(product);
    } catch (err) {
      console.error("Error adding product to cart:", err);
      alert("Failed to add product to cart. Please try again.");
    }
  }, [disabled, onAddToCart, product]);

  return (
    <div className="card h-100 product-card shadow-sm text-center p-2">
      {image ? (
        <img
          src={image}
          className="card-img-top product-image"
          alt={title}
          style={{ height: "150px", objectFit: "contain" }}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
          }}
        />
      ) : (
        <div
          className="card-img-top product-image d-flex justify-content-center align-items-center bg-light text-muted"
          style={{ height: "150px" }}
        >
          No Image
        </div>
      )}

      <div className="card-body d-flex flex-column justify-content-between">
        <div>
          <h6 className="card-title fw-semibold" title={title}>
            {title}
          </h6>
          <p className="card-text text-primary fw-semibold">${price.toFixed(2)}</p>
          <p className="card-text text-muted small">{capitalizeCategory(category)}</p>
          <p className="card-text text-muted small" title={description}>
            {description || "No description available."}
          </p>
          <div
            className="d-flex justify-content-center align-items-center mt-2"
            aria-label={`Rating: ${rating.rate} out of 5 stars based on ${rating.count} reviews`}
            role="img"
          >
            <span className="fw-semibold me-1">Rating:</span>
            {stars}
            <small className="text-muted ms-1">
              ({rating.count ? `${rating.count} review${rating.count > 1 ? "s" : ""}` : "No reviews"})
            </small>
          </div>
        </div>

        <div className="mt-3 text-center">
          <button
            className="btn btn-outline-primary btn-sm rounded-pill custom-hover"
            onClick={handleAddToCart}
            disabled={disabled}
            aria-disabled={disabled}
            aria-label={`Add ${title} to cart`}
            type="button"
          >
            Add to Cart
          </button>
          <div className="mt-2">
            <button
              type="button"
              onClick={handleViewReviews}
              className="btn btn-link p-0 view-review-link"
              aria-label={`View reviews for ${title}`}
            >
              View Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}