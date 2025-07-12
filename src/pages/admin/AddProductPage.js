import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react"; // Import React state hook and FormEvent type
import { useNavigate } from "react-router-dom"; // Import navigation hook from React Router
import { addProduct } from "../../firebase/productService"; // Import function to add product to Firebase
// Placeholder function that simulates fetching the current user information
const getCurrentUser = () => ({
    uid: "admin-uid",
    role: "admin",
});
// Component defined for admin users to add new products.
export default function AddProductPage() {
    //Function to programmatically navigate between routes
    const navigate = useNavigate();
    // Local states for managing form inputs, optional rating fields, error/success messages, and loading status
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState("");
    const [category, setCategory] = useState("");
    const [ratingRate, setRatingRate] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const currentUser = getCurrentUser(); // Get current user data
    // Validate all form inputs and return any errors
    const validateInputs = () => {
        const newErrors = [];
        if (!title.trim())
            newErrors.push("Title is required");
        if (!description.trim())
            newErrors.push("Description is required");
        if (!price.trim() || isNaN(Number(price)) || Number(price) < 0)
            newErrors.push("Valid price (0 or more) is required");
        if (!image.trim())
            newErrors.push("Image URL is required");
        if (!category.trim())
            newErrors.push("Category is required");
        if (ratingRate < 0 || ratingRate > 5)
            newErrors.push("Rating must be between 0 and 5");
        if (ratingCount < 0)
            newErrors.push("Rating count must be 0 or more");
        return newErrors;
    };
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setSuccessMessage("");
        // Check if current user is an admin
        if (currentUser.role !== "admin") {
            setErrors(["Only admins can add products."]);
            return;
        }
        // Validate form and handle errors
        const validationErrors = validateInputs();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }
        setLoading(true);
        try {
            // Call Firebase function to add the product
            await addProduct({
                title: title.trim(),
                description: description.trim(),
                price: parseFloat(price) || 0,
                image: image.trim(),
                category: category.trim(),
                createdBy: currentUser.uid,
                rating: {
                    rate: ratingRate,
                    count: ratingCount,
                },
            });
            // Show success message and reset form
            setSuccessMessage("Product added successfully!");
            setTitle("");
            setDescription("");
            setPrice("");
            setImage("");
            setCategory("");
            setRatingRate(0);
            setRatingCount(0);
            // After 1 second, navigate to manage products page
            setTimeout(() => {
                navigate("/admin/manage-products");
            }, 1000);
        }
        catch (error) {
            console.error("Error adding product:", error);
            setErrors(["Failed to add product. Please try again."]);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "app-wrapper", children: [" ", _jsxs("div", { className: "container mt-5 mb-5 px-4 px-sm-5", style: {
                    maxWidth: "700px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    paddingTop: "30px",
                    paddingBottom: "30px",
                }, children: [_jsx("h2", { className: "mb-4 text-center", children: "Add New Product" }), errors.length > 0 && (_jsx("div", { className: "alert alert-danger", role: "alert", children: _jsx("ul", { className: "mb-0", children: errors.map((err, idx) => (_jsx("li", { children: err }, idx))) }) })), successMessage && (_jsx("div", { className: "alert alert-success", role: "alert", children: successMessage })), _jsxs("form", { onSubmit: handleSubmit, noValidate: true, className: "d-flex flex-column gap-3 ", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "title", className: "form-label", children: ["Title ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("input", { id: "title", type: "text", className: "form-control", value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Enter product title", disabled: loading, required: true, autoComplete: "off" })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "description", className: "form-label", children: ["Description ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("textarea", { id: "description", className: "form-control", value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Enter product description", rows: 3, disabled: loading, required: true, style: { resize: "none" } })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "price", className: "form-label", children: ["Price ($) ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("input", { id: "price", type: "number", min: "0", step: "0.01", className: "form-control", value: price, onChange: (e) => setPrice(e.target.value), placeholder: "Enter price", disabled: loading, required: true })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "image", className: "form-label", children: ["Image URL ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("input", { id: "image", type: "url", className: "form-control", value: image, onChange: (e) => setImage(e.target.value), placeholder: "Image url", disabled: loading, required: true })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "category", className: "form-label", children: ["Category ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("input", { id: "category", type: "text", className: "form-control", value: category, onChange: (e) => setCategory(e.target.value), placeholder: "Enter category", disabled: loading, required: true, autoComplete: "off" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "ratingRate", className: "form-label", children: "Rating (Rate 0-5)" }), _jsx("input", { id: "ratingRate", type: "number", step: "0.1", min: "0", max: "5", className: "form-control", value: ratingRate, onChange: (e) => {
                                            const val = parseFloat(e.target.value);
                                            setRatingRate(isNaN(val) ? 0 : val);
                                        }, disabled: loading })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "ratingCount", className: "form-label", children: "Rating Count" }), _jsx("input", { id: "ratingCount", type: "number", min: "0", className: "form-control", value: ratingCount, onChange: (e) => {
                                            const val = parseInt(e.target.value);
                                            setRatingCount(isNaN(val) ? 0 : val);
                                        }, disabled: loading })] }), _jsx("div", { className: "d-flex justify-content-center mt-3", children: _jsx("button", { type: "submit", className: "btn btn-primary", disabled: loading, "aria-busy": loading, children: loading ? "Adding Product..." : "Add Product" }) })] })] })] }));
}
