import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Main component function for the product category filter
export default function ProductFilter({ categories, selected, onSelect, onClear, }) {
    // Handle change when the user selects a new category from the dropdown
    const handleChange = (e) => {
        try {
            // Trigger the onSelect callback with the selected category value
            onSelect(e.target.value);
        }
        catch (err) {
            console.error("Failed to select category:", err);
        }
    };
    // Handle when user clicks the Clear Filter button
    const handleClear = () => {
        try {
            // Trigger the onClear callback to reset the selected category
            onClear();
        }
        catch (err) {
            console.error("Failed to clear filter:", err);
        }
    };
    return (_jsxs("div", { className: "d-flex flex-wrap align-items-center gap-3 mb-3", children: [_jsx("label", { htmlFor: "category-filter", className: "form-label mb-0", children: "Filter by Category:" }), _jsxs("select", { id: "category-filter", className: "form-select", value: selected, onChange: handleChange, "aria-label": "Category Filter", style: { minWidth: "200px", maxWidth: "100%" }, children: [_jsx("option", { value: "", children: "All Categories" }), categories.map((cat) => (_jsx("option", { value: cat, children: cat }, cat)))] }), selected && (_jsx("button", { className: "btn btn-outline-secondary", onClick: handleClear, "aria-label": "Clear category filter", children: "Clear Filter" }))] }));
}
