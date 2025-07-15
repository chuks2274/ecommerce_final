import { useState, type FormEvent } from "react"; // Import useState for handling form data, FormEvent for typing form submit
import { useNavigate } from "react-router-dom";  // Import for redirecting after form submission
import { addProduct } from "../../firebase/productService";  // Import the function to add a product to Firebase

 // Simulated function to get current user info
const getCurrentUser = () => ({
  uid: "admin-uid",
  role: "admin",
});

// Main component for rendering the Add Product form and handling its logic
export default function AddProductPage() {

  // Function to programmatically navigate to another page
  const navigate = useNavigate();

   // Local state variables to manage form inputs, error/success messages, and loading status.
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [ratingRate, setRatingRate] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Get the current logged-in user info  
  const currentUser = getCurrentUser();

  // Update the correct field based on input name
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    switch (name) {
      case "title":
        setTitle(value);
        break;
      case "description":
        setDescription(value);
        break;
      case "price":
        setPrice(value);
        break;
      case "image":
        setImage(value);
        break;
      case "category":
        setCategory(value);
        break;
      case "ratingRate":
        const rate = parseFloat(value);
        setRatingRate(isNaN(rate) ? 0 : rate);
        break;
      case "ratingCount":
        const count = parseInt(value);
        setRatingCount(isNaN(count) ? 0 : count);
        break;
      default:
        break;
    }
  };

  // Check if inputs are valid
  const validateInputs = () => {
    const newErrors: string[] = [];
    if (!title.trim()) newErrors.push("Title is required");
    if (!description.trim()) newErrors.push("Description is required");
    if (!price.trim() || isNaN(Number(price)) || Number(price) < 0)
      newErrors.push("Valid price (0 or more) is required");
    if (!image.trim()) newErrors.push("Image URL is required");
    if (!category.trim()) newErrors.push("Category is required");
    if (ratingRate < 0 || ratingRate > 5)
      newErrors.push("Rating must be between 0 and 5");
    if (ratingCount < 0) newErrors.push("Rating count must be 0 or more");
    return newErrors;
  };

  // Handle form submission and add product.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear any previous error or success messages before validating new submission
    setErrors([]);
    setSuccessMessage("");

    // Check if the current user is an admin; if not, show error and stop
    if (currentUser.role !== "admin") {
      setErrors(["Only admins can add products."]);
      return;
    }
   // Run form validation; if there are errors, display them and stop
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      // Try to add the new product using cleaned form values and current user ID.
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
     // Show success message and reset all form fields to their initial empty state
      setSuccessMessage("Product added successfully!");
      setTitle("");
      setDescription("");
      setPrice("");
      setImage("");
      setCategory("");
      setRatingRate(0);
      setRatingCount(0);
    
       // Navigate to admin product page after 1 second
      setTimeout(() => {
        navigate("/admin/manage-products");
      }, 1000);
    } catch (error) {
      console.error("Error adding product:", error);
      setErrors(["Failed to add product. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <div
        className="container mt-5 mb-5 px-4 px-sm-5"
        style={{
          maxWidth: "700px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          paddingTop: "30px",
          paddingBottom: "30px",
        }}
      >
        <h2 className="mb-4 text-center">Add New Product</h2>
        {/* Show error messages if any */}
        {errors.length > 0 && (
          <div className="alert alert-danger" role="alert">
            <ul className="mb-0">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}
         {/* Show success message */}
        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}
        {/* Form for adding product */}
        <form onSubmit={handleSubmit} noValidate className="d-flex flex-column gap-3 ">
           {/* Input for Title */}
          <div>
            <label htmlFor="title" className="form-label">
              Title <span className="text-danger">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-control"
              value={title}
              onChange={handleChange}
              placeholder="Enter product title"
              disabled={loading}
              required
              autoComplete="off"
            />
          </div>
          {/* Input for Description */}
          <div>
            <label htmlFor="description" className="form-label">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              value={description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows={3}
              disabled={loading}
              required
              style={{ resize: "none" }}
            />
          </div>
             {/* Input for Price */}
          <div>
            <label htmlFor="price" className="form-label">
              Price ($) <span className="text-danger">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              className="form-control"
              value={price}
              onChange={handleChange}
              placeholder="Enter price"
              disabled={loading}
              required
            />
          </div>
          {/* Input for Image URL */}
          <div>
            <label htmlFor="image" className="form-label">
              Image URL <span className="text-danger">*</span>
            </label>
            <input
              id="image"
              name="image"
              type="url"
              className="form-control"
              value={image}
              onChange={handleChange}
              placeholder="Image url"
              disabled={loading}
              required
            />
          </div>
         {/* Input for Category */}
          <div>
            <label htmlFor="category" className="form-label">
              Category <span className="text-danger">*</span>
            </label>
            <input
              id="category"
              name="category"
              type="text"
              className="form-control"
              value={category}
              onChange={handleChange}
              placeholder="Enter category"
              disabled={loading}
              required
              autoComplete="off"
            />
          </div>
         {/* Input for Rating Rate */}
          <div>
            <label htmlFor="ratingRate" className="form-label">
              Rating (Rate 0-5)
            </label>
            <input
              id="ratingRate"
              name="ratingRate"
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="form-control"
              value={ratingRate}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="ratingCount" className="form-label">
              Rating Count
            </label>
            <input
              id="ratingCount"
              name="ratingCount"
              type="number"
              min="0"
              className="form-control"
              value={ratingCount}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
         {/* Submit Button */}
          <div className="d-flex justify-content-center mt-3">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Adding Product..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}