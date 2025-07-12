import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react"; // Import React and hooks for managing component state and lifecycle
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks for dispatching actions and selecting state
import { loadProducts, createProduct, updateProduct, deleteProduct, } from "../redux/slices/productSlice"; // Import Redux async action creators for products
// Define an empty product object as initial form state
const emptyProduct = {
    title: "",
    price: 0,
    category: "",
    image: "",
    description: "",
};
// Function to create a product object without 'id' property
function omitId(product) {
    // Return a new object without the 'id' field
    return {
        title: product.title,
        price: product.price,
        category: product.category,
        image: product.image,
        description: product.description,
        createdBy: product.createdBy,
    };
}
// Main component for admin product management
export default function AdminProducts() {
    // Get the dispatch function to send Redux actions
    const dispatch = useDispatch();
    // Select the product slice state: items, loading status, and error
    const { items, loading, error } = useSelector((state) => state.product);
    // Local states for managing the product form: current input values, edit/create mode, and validation error messages
    const [form, setForm] = useState(emptyProduct);
    const [editMode, setEditMode] = useState(false);
    const [formError, setFormError] = useState("");
    // Load all products when component first mounts
    useEffect(() => {
        dispatch(loadProducts());
    }, [dispatch]);
    // Handle changes in any input fields of the form
    function handleInputChange(e) {
        const { name, value } = e.target;
        // Update form state; convert 'price' to number, others keep as string
        setForm((prev) => ({
            ...prev,
            [name]: name === "price" ? Number(value) : value,
        }));
    }
    // Validate form inputs before submission
    function validateForm() {
        if (!form.title.trim()) {
            setFormError("Title is required.");
            return false;
        }
        if (isNaN(form.price) || form.price <= 0) {
            setFormError("Price must be a positive number.");
            return false;
        }
        if (!form.category.trim()) {
            setFormError("Category is required.");
            return false;
        }
        if (!form.image.trim()) {
            setFormError("Image URL is required.");
            return false;
        }
        setFormError("");
        return true;
    }
    // Handle form submission to create or update product
    function handleSubmit(e) {
        e.preventDefault();
        if (!validateForm())
            return;
        // Prepare product object to save with optional id
        const productToSave = {
            ...form,
            id: form.id ?? "",
        };
        if (editMode && form.id) {
            // If editing, dispatch update action
            dispatch(updateProduct(productToSave));
        }
        else {
            // If creating, remove 'id' and dispatch create action
            const newProduct = omitId(productToSave);
            dispatch(createProduct(newProduct));
        }
        // Reset form and exit edit mode after submit
        setForm(emptyProduct);
        setEditMode(false);
    }
    // Fill form with product data and enter edit mode
    function handleEdit(product) {
        setForm(product);
        setEditMode(true);
        setFormError("");
    }
    // Confirm and delete a product by id
    function handleDelete(id) {
        if (id && window.confirm("Are you sure to delete this product?")) {
            dispatch(deleteProduct(id));
            // If currently editing the deleted product, reset form
            if (editMode && form.id === id) {
                setForm(emptyProduct);
                setEditMode(false);
                setFormError("");
            }
        }
    }
    return (_jsxs("div", { className: "container mt-4", children: [_jsx("h2", { children: "Admin Product Management" }), _jsxs("form", { onSubmit: handleSubmit, className: "mb-4", children: [formError && _jsx("div", { className: "alert alert-danger", children: formError }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label", children: "Title" }), _jsx("input", { name: "title", className: "form-control", value: form.title, onChange: handleInputChange, required: true })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label", children: "Price" }), _jsx("input", { name: "price", type: "number", className: "form-control", value: form.price, onChange: handleInputChange, required: true, min: 0, step: "0.01" })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label", children: "Category" }), _jsx("input", { name: "category", className: "form-control", value: form.category, onChange: handleInputChange, required: true })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label", children: "Image URL" }), _jsx("input", { name: "image", className: "form-control", value: form.image, onChange: handleInputChange, required: true })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label", children: "Description" }), _jsx("textarea", { name: "description", className: "form-control", value: form.description, onChange: handleInputChange, rows: 3 })] }), _jsx("button", { type: "submit", className: "btn btn-primary me-2", disabled: loading, children: editMode ? "Update Product" : "Add Product" }), editMode && (_jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => {
                            setForm(emptyProduct);
                            setEditMode(false);
                            setFormError("");
                        }, children: "Cancel" }))] }), loading && _jsx("p", { children: "Loading products..." }), error && _jsx("p", { className: "text-danger", children: error }), _jsxs("table", { className: "table table-bordered", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Title" }), _jsx("th", { children: "Price" }), _jsx("th", { children: "Category" }), _jsx("th", { children: "Image" }), _jsx("th", { children: "Description" }), _jsx("th", { style: { width: 150 }, children: "Actions" })] }) }), _jsx("tbody", { children: items.map((p) => (_jsxs("tr", { children: [_jsx("td", { children: p.title }), _jsxs("td", { children: ["$", p.price.toFixed(2)] }), _jsx("td", { children: p.category }), _jsx("td", { children: _jsx("img", { src: p.image, alt: p.title, style: { width: 50, height: 50, objectFit: "cover" } }) }), _jsx("td", { children: p.description }), _jsxs("td", { children: [_jsx("button", { className: "btn btn-sm btn-warning me-2", onClick: () => handleEdit(p), children: "Edit" }), _jsx("button", { className: "btn btn-sm btn-danger", onClick: () => handleDelete(p.id), children: "Delete" })] })] }, p.id))) })] })] }));
}
