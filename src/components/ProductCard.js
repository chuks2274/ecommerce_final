import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo } from "react";
import { FaStar } from "react-icons/fa"; // Only FaStar imported
import { useNavigate } from "react-router-dom";
import "./components.css";

const capitalizeCategory = (category) =>
  category.charAt(0).toUpperCase() + category.slice(1);

export default function ProductCard({ product, onAddToCart, disabled = false }) {
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
          _jsx(FaStar, { className: "text-warning me-1", "aria-label": "Filled star" }, i)
        ) : (
          // Render empty stars as gray FaStar with inline style
          _jsx(
            FaStar,
            {
              className: "me-1",
              "aria-label": "Empty star",
              style: { color: "lightgray" },
            },
            i
          )
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

  return _jsxs(
    "div",
    {
      className: "card h-100 product-card shadow-sm text-center p-2",
      children: [
        image
          ? _jsx("img", {
              src: image,
              className: "card-img-top product-image",
              alt: title,
              style: { height: "150px", objectFit: "contain" },
              loading: "lazy",
              onError: (e) => {
                e.currentTarget.src = "/placeholder.png";
              },
            })
          : _jsx(
              "div",
              {
                className:
                  "card-img-top product-image d-flex justify-content-center align-items-center bg-light text-muted",
                style: { height: "150px" },
                children: "No Image",
              }
            ),
        _jsxs(
          "div",
          {
            className: "card-body d-flex flex-column justify-content-between",
            children: [
              _jsxs("div", {
                children: [
                  _jsx(
                    "h6",
                    { className: "card-title fw-semibold", title: title, children: title }
                  ),
                  _jsxs("p", { className: "card-text text-primary fw-semibold", children: ["$", price.toFixed(2)] }),
                  _jsx("p", { className: "card-text text-muted small", children: capitalizeCategory(category) }),
                  _jsx("p", { className: "card-text text-muted small", title: description, children: description || "No description available." }),
                  _jsxs(
                    "div",
                    {
                      className: "d-flex justify-content-center align-items-center mt-2",
                      "aria-label": `Rating: ${rating.rate} out of 5 stars based on ${rating.count} reviews`,
                      role: "img",
                      children: [
                        _jsx("span", { className: "fw-semibold me-1", children: "Rating:" }),
                        stars,
                        _jsxs("small", {
                          className: "text-muted ms-1",
                          children: [
                            "(",
                            rating.count ? `${rating.count} review${rating.count > 1 ? "s" : ""}` : "No reviews",
                            ")",
                          ],
                        }),
                      ],
                    }
                  ),
                ],
              }),
              _jsxs("div", {
                className: "mt-3 text-center",
                children: [
                  _jsx("button", {
                    className: "btn btn-outline-primary btn-sm rounded-pill custom-hover",
                    onClick: handleAddToCart,
                    disabled: disabled,
                    "aria-disabled": disabled,
                    "aria-label": `Add ${title} to cart`,
                    type: "button",
                    children: "Add to Cart",
                  }),
                  _jsx("div", {
                    className: "mt-2",
                    children: _jsx("button", {
                      type: "button",
                      onClick: handleViewReviews,
                      className: "btn btn-link p-0 view-review-link",
                      "aria-label": `View reviews for ${title}`,
                      children: "View Review",
                    }),
                  }),
                ],
              }),
            ],
          }
        ),
      ],
    }
  );
}