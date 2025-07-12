import { useState, type FormEvent } from "react"; // React state hook and FormEvent type
import { useNavigate } from "react-router-dom"; // Navigation hook
import { addProduct } from "../../firebase/productService"; // Firebase add product function

// Simulated current user info (admin)
const getCurrentUser = () => ({
  uid: "admin-uid",
  role: "admin",
});

export default function AddProductPage() {
  const navigate = useNavigate();

  // Form states
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

  const currentUser = getCurrentUser();

  // Generic input handler
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

  // Input validation
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

  // Submit handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setErrors([]);
    setSuccessMessage("");

    if (currentUser.role !== "admin") {
      setErrors(["Only admins can add products."]);
      return;
    }

    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
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

      setSuccessMessage("Product added successfully!");
      setTitle("");
      setDescription("");
      setPrice("");
      setImage("");
      setCategory("");
      setRatingRate(0);
      setRatingCount(0);

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

        {errors.length > 0 && (
          <div className="alert alert-danger" role="alert">
            <ul className="mb-0">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="d-flex flex-column gap-3 ">
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