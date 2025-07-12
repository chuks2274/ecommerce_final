import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from "react"; // Import React hooks for state, side effects, and memoized functions
import { fetchCategories } from "../firebase/productService"; // Import a function to get product categories from Firebase
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
// Create the CategorySearch component and receive props
export default function CategorySearch({ onCategoryChange }) {
    // Local states for managing category list, selected category, loading status, and fetch error
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // useEffect runs once when the component mounts
    useEffect(() => {
        // Define an async function to load categories
        const loadCategories = async () => {
            setLoading(true);
            setError(null);
            try {
                // Try fetching categories from the server
                const cats = await fetchCategories();
                setCategories(cats);
            }
            catch (err) {
                // Log and show an error message if something goes wrong
                console.error("Error loading categories:", err);
                setError("Failed to load categories");
            }
            finally {
                setLoading(false);
            }
        };
        loadCategories(); // Call the async function
    }, []); // Only run on initial mount
    // Function to handle selecting a new category from the dropdown
    const handleSelectCategory = useCallback((e) => {
        const value = e.target.value;
        setSelectedCategory(value);
        // If "All" is selected, pass empty string to parent; otherwise, pass the category
        onCategoryChange(value === "All" ? "" : value);
    }, [onCategoryChange] // Run when onCategoryChange changes
    );
    // Function to clear the selected category and reset to "All"
    const clearFilter = useCallback(() => {
        setSelectedCategory("All");
        onCategoryChange("");
    }, [onCategoryChange]); // Run when onCategoryChange changes
    return (_jsxs("div", { className: "mb-3", children: [_jsx("h5", { className: "mb-2", children: "Filter Product by Category" }), error && (_jsx("div", { className: "alert alert-danger py-1 px-2 mb-2", role: "alert", children: error })), _jsxs("div", { className: "d-flex align-items-center gap-3 flex-wrap", children: [_jsxs(Form.Select, { "aria-label": "Select product category", value: selectedCategory, onChange: handleSelectCategory, disabled: loading, style: { maxWidth: "300px", minWidth: "180px" }, children: [_jsx("option", { value: "All", children: "All" }), categories.map((cat) => (_jsx("option", { value: cat, children: cat.charAt(0).toUpperCase() + cat.slice(1) }, cat)))] }), loading && _jsx(Spinner, { animation: "border", size: "sm", role: "status" }), selectedCategory !== "All" && (_jsx(Button, { variant: "outline-danger", onClick: clearFilter, children: "Clear Filter" }))] })] }));
}
