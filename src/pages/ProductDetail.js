import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react"; // Import React hooks for state and lifecycle management
import { useParams } from "react-router-dom"; // Import route parameters (like product ID from the URL)
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, } from "firebase/firestore"; // Import Firestore functions for reading and deleting data
import { useAppSelector } from "../redux/hooks"; // Import a typed Redux selector hook to get product data
import { db } from "../firebase/firebase"; // Import Firebase database instance
import { useAuth } from "../hooks/useAuth"; // Import custom hook to get the logged-in user
import StarRating from "../components/StarRating"; // Import component to show star ratings
import { ProductReviewForm } from "../components/ProductReviewForm"; // Import component for submitting a new review
// Component for showing product details and reviews
export default function ProductDetail() {
    // Get the product ID from the URL
    const { id: productId } = useParams();
    // Get the current user (if logged in)
    const { currentUser } = useAuth();
    // Find the matching product from Redux state
    const product = useAppSelector((state) => state.product.items.find((p) => p.id === productId));
    // Local states to manage fetched reviews, error messages, and IDs of reviews currently being deleted
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);
    const [deleteLoadingIds, setDeleteLoadingIds] = useState([]);
    // If no product yet, we show a loading spinner
    const isLoading = !product;
    // If productId exists but product not found, it's invalid
    const isInvalid = productId && !product;
    // Load product reviews in real-time whenever productId changes
    useEffect(() => {
        if (!productId)
            return;
        // Path to reviews subcollection for this product
        const reviewsRef = collection(db, "products", productId, "reviews");
        // Create a query to sort by newest review first
        const q = query(reviewsRef, orderBy("createdAt", "desc"));
        // Listen for real-time changes in reviews
        const unsubscribe = onSnapshot(q, (snapshot) => {
            // Convert Firestore snapshot to a list of review objects
            const revs = snapshot.docs.map((doc) => {
                const data = doc.data();
                return { id: doc.id, ...data };
            });
            setReviews(revs);
            setError(null);
        }, (err) => {
            console.error("Error fetching reviews:", err);
            setError("Failed to load reviews.");
        });
        // Clean up the listener when component unmounts
        return () => unsubscribe();
    }, [productId]); // Run when productId changes
    // Function to delete a review
    const deleteReview = async (reviewId) => {
        // Stop if we don't have both product and logged-in user
        if (!productId || !currentUser)
            return;
        try {
            // Add review ID to the loading state
            setDeleteLoadingIds((ids) => [...ids, reviewId]);
            // Build path to the review in Firestore
            const reviewRef = doc(db, "products", productId, "reviews", reviewId);
            // Delete the review from Firestore
            await deleteDoc(reviewRef);
        }
        catch (error) {
            console.error("Failed to delete review:", error);
            alert("Failed to delete review. Try again.");
        }
        finally {
            // Remove ID from loading list after delete attempt
            setDeleteLoadingIds((ids) => ids.filter((id) => id !== reviewId));
        }
    };
    // Calculate the average rating across all reviews
    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
    // Show loading spinner if product is still loading
    if (isLoading) {
        return (_jsxs("div", { className: "container mt-4 text-center", children: [_jsx("div", { className: "spinner-border text-primary", role: "status" }), _jsx("p", { className: "mt-2", children: "Loading product..." })] }));
    }
    // Show error if product ID is invalid
    if (isInvalid) {
        return (_jsx("div", { className: "container mt-4 text-center", children: _jsx("p", { className: "text-danger", children: "Product not found. Please try another item." }) }));
    }
    // Main UI for product detail and reviews
    return (_jsxs("div", { className: "container mt-4", children: [_jsxs("div", { className: "row", children: [_jsx("div", { className: "col-md-6 text-center", children: _jsx("img", { src: product.image, alt: product.title, className: "img-fluid", style: { maxHeight: 400, objectFit: "contain" } }) }), _jsxs("div", { className: "col-md-6", children: [_jsx("h2", { className: "mb-3", children: product.title }), _jsxs("h4", { className: "text-success mb-3", children: ["$", product.price.toFixed(2)] }), _jsx("p", { children: product.description }), reviews.length > 0 && (_jsxs("div", { className: "mt-3", children: [_jsx("strong", { children: "Average Rating:" }), " ", _jsx(StarRating, { rating: averageRating, readOnly: true }), " (", reviews.length, " ", "reviews)"] }))] })] }), _jsx("hr", {}), _jsxs("div", { className: "mt-4", children: [_jsx("h3", { children: "Reviews" }), error && _jsx("p", { className: "text-danger", children: error }), reviews.length === 0 && _jsx("p", { className: "text-muted", children: "No reviews yet." }), _jsx("ul", { className: "list-group mb-4", children: reviews.map((rev) => (_jsx("li", { className: "list-group-item bg-white rounded shadow-sm mb-2", children: _jsxs("div", { className: "d-flex justify-content-between flex-column flex-md-row", children: [_jsxs("div", { children: [_jsx("strong", { children: rev.userName }), " -", " ", new Date(rev.createdAt.seconds * 1000).toLocaleString(), _jsx("div", { className: "mt-1", children: _jsx(StarRating, { rating: rev.rating, readOnly: true }) }), _jsx("p", { className: "mb-0", children: rev.comment })] }), currentUser?.uid === rev.userId && (_jsx("button", { className: "btn btn-sm btn-outline-danger mt-2 mt-md-0", onClick: () => deleteReview(rev.id), disabled: deleteLoadingIds.includes(rev.id), children: deleteLoadingIds.includes(rev.id)
                                            ? "Deleting..."
                                            : "Delete" }))] }) }, rev.id))) }), currentUser && productId ? (_jsx(ProductReviewForm, { userId: currentUser.uid, productId: productId })) : (_jsx("p", { className: "text-muted", children: "Please log in to add a review." }))] })] }));
}
