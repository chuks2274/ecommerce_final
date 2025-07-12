import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo } from "react"; // Import React hooks for side effects and memoization (performance)
import { useAppDispatch, useAppSelector } from "../redux/hooks"; // Import custom Redux hooks to read and update state
import { loadProducts, setSearch, clearSearch, setCategory, clearCategory, } from "../redux/slices/productSlice"; // Import actions to load products and manage filters
import { addToCart } from "../redux/slices/cartSlice"; // Import the action to add a product to the cart
import ProductCard from "../components/ProductCard"; // Import the reusable ProductCard component
// Main component to show a list of products
export default function ProductList() {
    // Set up dispatch function to send actions to Redux store
    const dispatch = useAppDispatch();
    // Read product-related state from Redux: product list, search text, selected category
    const { items, search, category } = useAppSelector((state) => state.product);
    // Run this effect when the component loads to fetch product data
    useEffect(() => {
        try {
            dispatch(loadProducts()); // Dispatch action to fetch products
        }
        catch (error) {
            console.error("Failed to load products:", error);
        }
    }, [dispatch]); // Run this only once when component mounts
    // Tell TypeScript to treat the items as an array of Product
    const typedItems = items;
    // Filter the products based on selected category and search text
    const filtered = useMemo(() => {
        return typedItems.filter((product) => {
            // Check if the category matches or is set to "all"
            const matchCategory = category === "all" || product.category === category;
            // Check if the search term is found in the product title
            const matchSearch = product.title.toLowerCase().includes(search.toLowerCase());
            return matchCategory && matchSearch; // Only show products that match both
        });
    }, [typedItems, search, category]); //Run only when typedItems, search, or category changes 
    // Create a list of unique categories for the dropdown
    const categories = useMemo(() => Array.from(new Set(typedItems.map((product) => product.category))), [typedItems]);
    // Function to handle when "Add to Cart" is clicked
    const handleAddToCart = (product) => {
        dispatch(addToCart({
            id: product.id,
            title: product.title,
            price: product.price,
            category: product.category,
            image: product.image,
            quantity: 1,
            rating: product.rating?.rate ?? 0,
        }));
    };
    return (_jsxs("div", { className: "container mt-4", children: [_jsxs("div", { className: "row mb-3 g-3 align-items-end", children: [_jsxs("div", { className: "col-md-6 col-lg-4", children: [_jsx("input", { type: "text", className: "form-control", placeholder: "Search product title...", value: search, onChange: (e) => dispatch(setSearch(e.target.value)) }), search && (_jsx("button", { className: "btn btn-sm btn-outline-secondary mt-1", onClick: () => dispatch(clearSearch()), children: "Clear Search" }))] }), _jsxs("div", { className: "col-md-6 col-lg-4", children: [_jsxs("select", { className: "form-select", value: category, onChange: (e) => dispatch(setCategory(e.target.value)), children: [_jsx("option", { value: "all", children: "All Categories" }), categories.map((cat, i) => (_jsx("option", { value: cat, children: cat }, i)))] }), category !== "all" && (_jsx("button", { className: "btn btn-sm btn-outline-secondary mt-1", onClick: () => dispatch(clearCategory()), children: "Clear Category" }))] })] }), _jsx("div", { className: "row", children: filtered.length === 0 ? (_jsx("div", { className: "col-12 text-center text-muted", children: _jsx("p", { children: "No products found. Try a different search or category." }) })) : (
                // Otherwise, show each product card
                filtered.map((product) => (_jsx("div", { className: "col-12 col-sm-6 col-md-4 col-lg-3 mb-4", children: _jsx(ProductCard, { product: product, onAddToCart: handleAddToCart }) }, product.id)))) })] }));
}
