import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, memo } from "react"; // Import React and hooks needed for callbacks and typing
// Define the StarRating component and wrap it in React.memo to avoid unnecessary re-renders
const StarRating = memo((props) => {
    const { rating = 0, setRating, reviewCount = 0, readOnly = false, } = props;
    // Calculate number of full stars (integer part of rating)
    const fullStars = Math.floor(rating);
    // Calculate fractional part of rating (e.g., 0.5)
    const fractionalPart = rating - fullStars;
    // Determine if a half-star should be displayed (if between 0.25 and 0.75)
    const hasHalfStar = fractionalPart >= 0.25 && fractionalPart < 0.75;
    // Check if the stars should be interactive (editable)
    const isInteractive = Boolean(setRating && !readOnly);
    // Handle click event to update the star rating
    const handleClick = useCallback((value) => {
        // Only proceed if the rating is editable and the setRating function exists
        if (isInteractive && setRating) {
            try {
                setRating(value); // Update the rating with the selected value
            }
            catch (error) {
                console.error("Failed to set rating:", error);
            }
        }
    }, [isInteractive, setRating]); // Run when isInteractive, setRating changes
    // Handle keyboard events (Enter or Space) for accessibility
    const handleKeyDown = useCallback((e, value) => {
        // If Enter or Space is pressed and the stars are interactive
        if ((e.key === "Enter" || e.key === " ") && isInteractive) {
            handleClick(value); // Trigger rating update via keyboard
        }
    }, [handleClick, isInteractive]); // Run when handleClick, isInteractive changes
    // Render a single star (full, half, or empty) based on index
    const renderStar = (index) => {
        // Check if this star should be full
        const isFull = index < fullStars;
        // Check if this star should be a half star
        const isHalf = index === fullStars && hasHalfStar;
        // Base style for all stars
        const baseStyle = {
            cursor: isInteractive ? "pointer" : "default",
            fontSize: "1.2rem",
            userSelect: "none",
            marginRight: 2,
        };
        // Render half star with overlapping spans for visual effect
        if (isHalf) {
            return (_jsx("span", { style: baseStyle, onClick: () => handleClick(index + 1), onKeyDown: (e) => handleKeyDown(e, index + 1), role: isInteractive ? "button" : undefined, "aria-label": isInteractive ? `${index + 1} star` : undefined, tabIndex: isInteractive ? 0 : undefined, children: _jsxs("span", { style: {
                        position: "relative",
                        display: "inline-block",
                        width: "1em",
                    }, children: [_jsx("span", { style: {
                                position: "absolute",
                                overflow: "hidden",
                                width: "50%",
                                color: "gold",
                            }, children: "\u2605" }), _jsx("span", { style: { color: "lightgray" }, children: "\u2605" }), " "] }) }, index));
        }
        // Render full or empty star
        return (_jsx("span", { style: { ...baseStyle, color: isFull ? "gold" : "lightgray" }, onClick: () => handleClick(index + 1), onKeyDown: (e) => handleKeyDown(e, index + 1), role: isInteractive ? "button" : undefined, "aria-label": isInteractive ? `${index + 1} star` : undefined, tabIndex: isInteractive ? 0 : undefined, children: "\u2605" }, index));
    };
    // Render the full star rating component
    return (_jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 6,
        }, "aria-label": `Rating: ${rating} out of 5`, children: [_jsx("span", { style: {
                    fontWeight: 600,
                    userSelect: "none",
                    color: "black",
                    whiteSpace: "nowrap",
                }, children: "Rating:" }), [...Array(5)].map((_, i) => renderStar(i)), _jsx("span", { style: {
                    marginLeft: 6,
                    color: "#555",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                }, children: reviewCount > 0
                    ? `(${reviewCount} review${reviewCount !== 1 ? "s" : ""})`
                    : "(No reviews)" })] }));
});
// Export the memoized component as default
export default StarRating;
