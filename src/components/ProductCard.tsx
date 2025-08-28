import { useCallback, useMemo } from "react";  // Import React hooks for optimization
import { FaStar } from "react-icons/fa";  // Import star icon for rating display
import type { Product } from "../types";  // Import Product type for TypeScript
import { useNavigate } from "react-router-dom";  // Import navigation hook for page changes
import "./components.css";// Import styles for the component

// Props for ProductCard: product data, add-to-cart handler, optional disable flag, and isLoggedIn flag
interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
  disabled?: boolean;
  isLoggedIn?: boolean; 
}

// Helper function to capitalize first letter of category string
const capitalizeCategory = (category: string) =>
  category.charAt(0).toUpperCase() + category.slice(1);

// Define and export the ProductCard component, taking product data, an add-to-cart handler, an optional disabled flag, and login status
export default function ProductCard({ product, onAddToCart, disabled = false, isLoggedIn = false }: Props) {

  // Function to programmatically change routes 
  const navigate = useNavigate();

  // Destructure product properties with safe default values, falling back to an empty object {} if product is null or undefined
  const {
    id = "",
    title = "No title",
    image = "",
    price = 0,
    rating = { rate: 0, count: 0 },
    description = "",
    category = "",
  } = product || {};

  // Create an array of 5 stars, filled or empty depending on rating
  const stars = useMemo(() => {
    // Round the product rating to the nearest whole number
    const filledStars = Math.round(rating?.rate || 0);

    // Create an array of 5 items and map each to a filled or empty star based on the rating
    return Array(5)
      .fill(0)
      .map((_, i) =>
        i < filledStars ? (
          <FaStar key={i} className="text-warning me-1" aria-label="Filled star" />
        ) : (
          // Use FaStar with lighter color for empty star effect
          <FaStar
            key={i}
            className="me-1"
            aria-label="Empty star"
            style={{ color: "lightgray" }}
          />
        )
      );
  }, [rating?.rate]); // Run when product's rating changes

  // Navigate to the product's reviews page if the product ID exists
  const handleViewReviews = useCallback(() => {
    if (!id) return;
    navigate(`/reviews/${id}`);
  }, [id, navigate]);  // Run when id or navigate changes

  // Call onAddToCart function safely when user clicks "Add to Cart"
  const handleAddToCart = useCallback(() => {
    if (disabled || !product) return;
    try {
      onAddToCart(product);
    } catch (err) {
      console.error("Error adding product to cart:", err);
      alert("Failed to add product to cart. Please try again.");
    }
  }, [disabled, onAddToCart, product]); // Run when disabled flag, product, or add-to-cart function changes

  // Handle image error: fallback only to placeholder
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/placeholder.png";
  };

  return (
    <div className="card h-100 product-card shadow-sm text-center p-2">
      {/* Show product image if available, else show placeholder */}
      {image ? (
        <img
          src={image}  // Firestore already stores the _t.png version
          className="card-img-top product-image"
          alt={title}
          style={{ height: "150px", objectFit: "contain" }}
          loading="lazy"
          onError={handleImageError}
        />
      ) : (
        <div
          className="card-img-top product-image d-flex justify-content-center align-items-center bg-light text-muted"
          style={{ height: "150px" }}
        >
          No Image
        </div>
      )}
      {/* Card content with title, price, category, description and rating */}
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
          {/* Rating stars and count */}
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
      {/* Buttons for Add to Cart and View Review */}
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
            {/* Show View Review only if user is logged in */}
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleViewReviews}
                className="btn btn-link p-0 view-review-link"
                aria-label={`View reviews for ${title}`}
              >
                View Review
              </button>
            ) : (
              // Public users do not see View Review link at all
              null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
