import { useEffect, useState, useCallback, useRef } from "react"; // Import React hooks we need
import {
  doc,
  deleteDoc,
  updateDoc,
  QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore"; // Import Firestore functions and types
import { db } from "../../firebase/firebase"; // Import Firebase Firestore database instance
import { Button, Modal, Form, Spinner, Alert } from "react-bootstrap"; // Import Bootstrap UI components
import {
  fetchProductsByPage,
  type Product,
} from "../../services/fetchProductsByPage"; // Import function to fetch products by page and Product type
import "../pages.css"; // Import global CSS styling for the page

 // Main component for managing products in admin page
export default function ManageProductsPage() {

  // Keep track of Firestore document snapshots for pagination
  const pageStartDocsRef = useRef<QueryDocumentSnapshot<DocumentData>[]>([]);

  // Local state to manage products list, loading/error status, pagination, deletion, and editing UI controls
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Function to load products for given page
  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchProductsByPage(
        page,
        pageStartDocsRef,
        setProducts,
        setHasNextPage,
        setLoading,
        setError
      );
    },
    [setProducts, setHasNextPage, setLoading, setError] // Run when any of these setters change
  );
 // Load first page on component mount
  useEffect(() => {
    goToPage(0);
  }, [goToPage]);

  // Delete product by id
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      // delete from Firestore
      await deleteDoc(doc(db, "products", id));

      // If last product on page and not first page, go back one page
      if (products.length === 1 && currentPage > 0) {

         // remove page start doc for current page
        pageStartDocsRef.current.splice(currentPage, 1);

         // go to previous page
        goToPage(currentPage - 1);
      } else {
        // reload current page
        goToPage(currentPage);
      }
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };
 // Update product details in Firestore
  const handleUpdate = async () => {

    // if no product editing, do nothing
    if (!editingProduct) return;

     // Validate inputs before updating
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
      // Update product document in Firestore with trimmed and validated fields including nested rating info
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
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to update product. Please try again.");
    } finally {
      setLoading(false);
    }
  };
   // Open edit modal with selected product
  const openModal = (product: Product) => {

    // copy product to editing state
    setEditingProduct({ ...product });
    setError(null);
    setShowEditModal(true);
  };
  // Close edit modal and reset state
  const closeModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    setError(null);
  };

  // Handle form input changes in edit modal
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editingProduct) return;

    const { name, value, type } = e.target;
     
    // Check if the input name is for a rating field, then get the specific rating key (like 'rate' or 'count') and
    if (name.startsWith("rating.")) {
      const ratingKey = name.split(".")[1] as keyof NonNullable<Product["rating"]>;
      let parsedValue: number = 0;

      // If input type is number, parse the value as an integer for 'count' or as a float for 'rate'; default to 0 if parsing fails
      if (type === "number") {
        parsedValue =
          ratingKey === "count"
            ? parseInt(value) || 0
            : parseFloat(value) || 0;
      }

      // Keep 'rate' between 0 and 5; ensure 'count' is at least 0 (no negative values)
      if (ratingKey === "rate") {
        parsedValue = Math.min(5, Math.max(0, parsedValue));
      } else if (ratingKey === "count") {
        parsedValue = Math.max(0, parsedValue);
      }
     // Update rating with new value for ratingKey
      setEditingProduct((prev) => ({
        ...prev!,
        rating: {
          ...(prev?.rating ?? { rate: 0, count: 0 }),
          [ratingKey]: parsedValue,
        },
      }));

      return;
    }
   // For normal fields, convert number inputs to numbers and keep text as is
    let newValue: string | number = value;

    if (type === "number") {
      newValue = Math.max(0, parseFloat(value) || 0);
    }
   // Update product field with new value
    setEditingProduct((prev) => ({
      ...prev!,
      [name]: newValue,
    }));
  };
   // UI for the page
  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Manage Products</h2>
        {/* Show error alert if any error */}
      {error && (
        <Alert
          variant="danger"
          onClose={() => setError(null)}
          dismissible
          className="mb-3"
        >
          {error}
        </Alert>
      )}
     {/* Show loading spinner if loading and no products yet */}
      {loading && !products.length ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" role="status" />
        </div>
      ) : products.length === 0 ? (
         // Show message if no products found
        <p className="text-center text-muted">No products found.</p>
      ) : (
        <>
         {/* Table of products */}
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Image</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td>{prod.title}</td>
                    <td
                      style={{
                        maxWidth: "300px",
                        whiteSpace: "normal",
                        color: "#555",
                        fontSize: "0.9rem",
                      }}
                    >
                      {prod.description || "—"}
                    </td>
                    <td>${prod.price.toFixed(2)}</td>
                    <td>{prod.category}</td>
                    <td>
                      <img
                        src={prod.image}
                        alt={prod.title}
                        height={50}
                        style={{ objectFit: "contain" }}
                      />
                    </td>
                    <td>
                      {prod.rating && prod.rating.rate > 0
                        ? `$${prod.rating.rate.toFixed(1)} (${prod.rating.count})`
                        : "N/A"}
                    </td>
                    <td>
                      {/* Buttons for editing and deleting */}
                      <div className="d-flex flex-column gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="py-0 px-1"
                          onClick={() => openModal(prod)}
                          disabled={loading}
                        >
                          Edit
                        </Button>

                        {confirmDeleteId === prod.id ? (
                          <>
                            <div className="text-danger small">
                              Confirm delete?
                            </div>
                            <div className="d-flex gap-2">
                              <Button
                                variant="danger"
                                size="sm"
                                className="py-0 px-1"
                                onClick={() => handleDelete(prod.id)}
                                disabled={deletingId === prod.id || loading}
                              >
                                {deletingId === prod.id ? (
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  "Yes"
                                )}
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="py-0 px-1"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </>
                        ) : (
                          // Show delete button normally
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="py-0 px-1"
                            onClick={() => setConfirmDeleteId(prod.id)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
         {/* Pagination controls */}
          <div className="d-flex justify-content-center align-items-center gap-2 my-4 flex-wrap">
            <Button
              className="me-2"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0 || loading}
              variant="primary"
            >
              ⬅️ Prev
            </Button>

            <Button variant="secondary" disabled>
              Page {currentPage + 1}
            </Button>

            <Button
              className="ms-2"
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasNextPage || loading}
              variant="primary"
            >
              Next ➡️
            </Button>
          </div>
        </>
      )}
    {/* Modal for editing product */}
      <Modal
        show={showEditModal}
        onHide={closeModal}
        centered
        contentClassName="custom-modal-content"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>

        {editingProduct && (
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="editProductTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={editingProduct.title}
                  onChange={handleChange}
                  autoFocus
                  required
                  maxLength={100}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editProductDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={editingProduct.description || ""}
                  onChange={handleChange}
                  maxLength={1000}
                  style={{ resize: "none" }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editProductPrice">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  step="0.01"
                  name="price"
                  value={editingProduct.price}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editProductImage">
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  type="url"
                  name="image"
                  value={editingProduct.image}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editProductCategory">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  name="category"
                  value={editingProduct.category}
                  onChange={handleChange}
                  required
                  maxLength={50}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editProductRatingRate">
                <Form.Label>Rating (0 to 5)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  min={0}
                  max={5}
                  name="rating.rate"
                  value={editingProduct.rating?.rate ?? 0}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editProductRatingCount">
                <Form.Label>Rating Count</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  name="rating.count"
                  value={editingProduct.rating?.count ?? 0}
                  onChange={handleChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
        )}

        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal} disabled={loading}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleUpdate} disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Updating...
              </>
            ) : (
              "Update Product"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}