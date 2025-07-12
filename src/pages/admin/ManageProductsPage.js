import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback, useRef } from "react"; // Import state, side effects, memoization, and references
import { doc, deleteDoc, updateDoc, } from "firebase/firestore"; // Import Firestore functions for database operations
import { db } from "../../firebase/firebase"; // Import the Firestore database configuration
import { Button, Modal, Form, Spinner, Alert } from "react-bootstrap"; // Import Bootstrap components for UI
import { fetchProductsByPage, } from "../../services/fetchProductsByPage"; // Import a function to fetch products by page and its type
// Main component that displays, edits, deletes, and paginates products
export default function ManageProductsPage() {
    // Local state for product list, loading status, and error handling
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Keep track of the start document for each page to enable Firestore pagination
    const pageStartDocsRef = useRef([]);
    // Local state for pagination, delete confirmation, loading states, and editing modal handling
    const [currentPage, setCurrentPage] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    // Function to load a specific page of products
    const goToPage = useCallback((page) => {
        setCurrentPage(page);
        fetchProductsByPage(page, pageStartDocsRef, setProducts, setHasNextPage, setLoading, setError);
    }, 
    // Dependency array with stable state setter functions (safe to include)
    [setProducts, setHasNextPage, setLoading, setError]);
    // Load first page when component mounts
    useEffect(() => {
        goToPage(0);
    }, [goToPage]);
    // Function to delete a product
    const handleDelete = async (id) => {
        setDeletingId(id);
        setError(null);
        try {
            await deleteDoc(doc(db, "products", id)); // Delete from Firestore
            // If only one product remains on a non-first page, go back one page; otherwise, reload current page
            if (products.length === 1 && currentPage > 0) {
                pageStartDocsRef.current.splice(currentPage, 1);
                goToPage(currentPage - 1);
            }
            else {
                goToPage(currentPage);
            }
            setConfirmDeleteId(null);
        }
        catch (err) {
            console.error("Delete failed:", err);
            setError("Failed to delete product. Please try again.");
        }
        finally {
            setDeletingId(null);
        }
    };
    // Function to update product data
    const handleUpdate = async () => {
        if (!editingProduct)
            return;
        // Validate input fields before sending update
        if (!editingProduct.title.trim()) {
            setError("Title cannot be empty.");
            return;
        }
        if (editingProduct.price < 0) {
            setError("Price cannot be negative.");
            return;
        }
        if (!editingProduct.image.trim()) {
            setError("Image URL cannot be empty.");
            return;
        }
        if (!editingProduct.category.trim()) {
            setError("Category cannot be empty.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Update product in Firestore
            await updateDoc(doc(db, "products", editingProduct.id), {
                title: editingProduct.title.trim(),
                description: editingProduct.description?.trim() ?? "",
                price: editingProduct.price,
                image: editingProduct.image.trim(),
                category: editingProduct.category.trim(),
                rating: {
                    rate: editingProduct.rating?.rate ?? 0,
                    count: editingProduct.rating?.count ?? 0,
                },
            });
            setShowEditModal(false);
            goToPage(currentPage);
        }
        catch (err) {
            console.error("Update failed:", err);
            setError("Failed to update product. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };
    // Open edit modal and load selected product
    const openModal = (product) => {
        setEditingProduct({ ...product }); // Clone product
        setError(null);
        setShowEditModal(true);
    };
    // Close modal and reset state
    const closeModal = () => {
        setShowEditModal(false);
        setEditingProduct(null);
        setError(null);
    };
    return (_jsxs("div", { className: "container mt-5", children: [_jsx("h2", { className: "mb-4 text-center", children: "Manage Products" }), error && (_jsx(Alert, { variant: "danger", onClose: () => setError(null), dismissible: true, className: "mb-3", children: error })), loading && !products.length ? (_jsx("div", { className: "d-flex justify-content-center my-5", children: _jsx(Spinner, { animation: "border", role: "status" }) })) : products.length === 0 ? (
            // No products found
            _jsx("p", { className: "text-center text-muted", children: "No products found." })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-bordered align-middle", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "Title" }), _jsx("th", { children: "Description" }), _jsx("th", { children: "Price" }), _jsx("th", { children: "Category" }), _jsx("th", { children: "Image" }), _jsx("th", { children: "Rating" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: products.map((prod) => (_jsxs("tr", { children: [_jsx("td", { children: prod.title }), _jsx("td", { style: {
                                                    maxWidth: "300px",
                                                    whiteSpace: "normal",
                                                    color: "#555",
                                                    fontSize: "0.9rem",
                                                }, children: prod.description || "—" }), _jsxs("td", { children: ["$", prod.price.toFixed(2)] }), _jsx("td", { children: prod.category }), _jsx("td", { children: _jsx("img", { src: prod.image, alt: prod.title, height: 50, style: { objectFit: "contain" } }) }), _jsx("td", { children: prod.rating && prod.rating.rate > 0
                                                    ? `${prod.rating.rate.toFixed(1)} (${prod.rating.count})`
                                                    : "N/A" }), _jsx("td", { children: _jsxs("div", { className: "d-flex flex-column gap-2", children: [_jsx(Button, { variant: "primary", size: "sm", className: "py-0 px-1", onClick: () => openModal(prod), disabled: loading, children: "Edit" }), confirmDeleteId === prod.id ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-danger small", children: "Confirm delete?" }), _jsxs("div", { className: "d-flex gap-2", children: [_jsx(Button, { variant: "danger", size: "sm", className: "py-0 px-1", onClick: () => handleDelete(prod.id), disabled: deletingId === prod.id || loading, children: deletingId === prod.id ? (_jsx(Spinner, { as: "span", animation: "border", size: "sm", role: "status", "aria-hidden": "true" })) : ("Yes") }), _jsx(Button, { variant: "secondary", size: "sm", className: "py-0 px-1", onClick: () => setConfirmDeleteId(null), children: "Cancel" })] })] })) : (
                                                        // Show delete button if not confirming
                                                        _jsx(Button, { variant: "outline-danger", size: "sm", className: "py-0 px-1", onClick: () => setConfirmDeleteId(prod.id), disabled: loading, children: "Delete" }))] }) })] }, prod.id))) })] }) }), _jsxs("div", { className: "d-flex justify-content-center align-items-center gap-2 my-4 flex-wrap", children: [_jsx(Button, { className: "me-2", onClick: () => goToPage(currentPage - 1), disabled: currentPage === 0 || loading, variant: "primary", children: "\u2B05\uFE0F Prev" }), _jsxs(Button, { variant: "secondary", disabled: true, children: ["Page ", currentPage + 1] }), _jsx(Button, { className: "ms-2", onClick: () => goToPage(currentPage + 1), disabled: !hasNextPage || loading, variant: "primary", children: "Next \u27A1\uFE0F" })] })] })), _jsxs(Modal, { show: showEditModal, onHide: closeModal, centered: true, contentClassName: "custom-modal-content", children: [_jsx(Modal.Header, { closeButton: true, children: _jsx(Modal.Title, { children: "Edit Product" }) }), editingProduct && (_jsx(Modal.Body, { children: _jsxs(Form, { children: [_jsxs(Form.Group, { className: "mb-3", controlId: "editProductTitle", children: [_jsx(Form.Label, { children: "Title" }), _jsx(Form.Control, { type: "text", value: editingProduct.title, onChange: (e) => setEditingProduct({
                                                ...editingProduct,
                                                title: e.target.value,
                                            }), autoFocus: true, required: true, maxLength: 100 })] }), _jsxs(Form.Group, { className: "mb-3", controlId: "editProductDescription", children: [_jsx(Form.Label, { children: "Description" }), _jsx(Form.Control, { as: "textarea", rows: 3, value: editingProduct.description || "", onChange: (e) => setEditingProduct({
                                                ...editingProduct,
                                                description: e.target.value,
                                            }), maxLength: 1000, style: { resize: "none" } })] }), _jsxs(Form.Group, { className: "mb-3", controlId: "editProductPrice", children: [_jsx(Form.Label, { children: "Price" }), _jsx(Form.Control, { type: "number", min: 0, step: "0.01", value: editingProduct.price, onChange: (e) => setEditingProduct({
                                                ...editingProduct,
                                                price: Math.max(0, parseFloat(e.target.value) || 0),
                                            }), required: true })] }), _jsxs(Form.Group, { className: "mb-3", controlId: "editProductImage", children: [_jsx(Form.Label, { children: "Image URL" }), _jsx(Form.Control, { type: "url", value: editingProduct.image, onChange: (e) => setEditingProduct({
                                                ...editingProduct,
                                                image: e.target.value,
                                            }), required: true })] }), _jsxs(Form.Group, { className: "mb-3", controlId: "editProductCategory", children: [_jsx(Form.Label, { children: "Category" }), _jsx(Form.Control, { type: "text", value: editingProduct.category, onChange: (e) => setEditingProduct({
                                                ...editingProduct,
                                                category: e.target.value,
                                            }), required: true, maxLength: 50 })] }), _jsxs(Form.Group, { className: "mb-3", controlId: "editProductRatingRate", children: [_jsx(Form.Label, { children: "Rating (0 to 5)" }), _jsx(Form.Control, { type: "number", step: "0.1", min: 0, max: 5, value: editingProduct.rating?.rate ?? 0, onChange: (e) => setEditingProduct({
                                                ...editingProduct,
                                                rating: {
                                                    count: editingProduct.rating?.count ?? 0,
                                                    rate: Math.min(5, Math.max(0, parseFloat(e.target.value) || 0)),
                                                },
                                            }) })] }), _jsxs(Form.Group, { className: "mb-3", controlId: "editProductRatingCount", children: [_jsx(Form.Label, { children: "Rating Count" }), _jsx(Form.Control, { type: "number", min: 0, value: editingProduct.rating?.count ?? 0, onChange: (e) => setEditingProduct({
                                                ...editingProduct,
                                                rating: {
                                                    rate: editingProduct.rating?.rate ?? 0,
                                                    count: Math.max(0, parseInt(e.target.value) || 0),
                                                },
                                            }) })] })] }) })), _jsxs(Modal.Footer, { children: [_jsx(Button, { variant: "secondary", onClick: closeModal, disabled: loading, children: "Cancel" }), _jsx(Button, { variant: "success", onClick: handleUpdate, disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Spinner, { animation: "border", size: "sm", role: "status", "aria-hidden": "true" }), " ", "Updating..."] })) : ("Update Product") })] })] })] }));
}
