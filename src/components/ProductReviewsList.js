import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react"; // Import React hooks for using state and side effects
import { collection, query, onSnapshot, deleteDoc, doc, where, orderBy, } from "firebase/firestore"; // Import Firestore functions to interact with the database
import { db } from "../firebase/firebase"; // Import the Firestore database configuration
// Function to render stars for the rating
const renderStars = (rating) => {
    const fullStars = "★".repeat(rating);
    const emptyStars = "☆".repeat(5 - rating);
    return (_jsxs("span", { className: "text-warning fw-bold", children: [fullStars, _jsx("span", { className: "text-muted", children: emptyStars })] }));
};
// Main component to show the list of reviews for a product
export function ProductReviewsList({ productId, userId }) {
    // Local state to manage fetched reviews, loading status, error messages, and delete confirmation flow.
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    // Load reviews from Firestore when the component loads or when productId changes
    useEffect(() => {
        if (!productId)
            return;
        setLoading(true);
        setError("");
        // Reference to the "reviews" collection in Firestore
        const reviewsRef = collection(db, "reviews");
        // Create a query to fetch reviews for the current product, sorted by newest first
        const q = query(reviewsRef, where("productId", "==", productId), orderBy("createdAt", "desc"));
        // Listen for real-time updates from Firestore
        const unsubscribe = onSnapshot(q, (snapshot) => {
            // Convert Firestore documents into Review objects
            const fetched = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    comment: data.comment,
                    createdAt: data.createdAt ?? null,
                    productId: data.productId,
                    rating: data.rating,
                    userId: data.userId,
                };
            });
            // Save the reviews and stop loading
            setReviews(fetched);
            setLoading(false);
        }, (err) => {
            console.error("Error loading reviews:", err);
            setError("Failed to load reviews.");
            setLoading(false);
        });
        // Cleanup listener when component unmounts or productId changes
        return () => unsubscribe();
    }, [productId]); // Run when productId changes
    // Handle review deletion
    const handleDelete = async (reviewId) => {
        // Make sure the user is logged in
        if (!userId) {
            setError("You must be logged in to delete a review.");
            return;
        }
        setDeletingId(reviewId);
        setError("");
        try {
            // Delete the review from Firestore
            await deleteDoc(doc(db, "reviews", reviewId));
            setConfirmDeleteId(null);
        }
        catch (err) {
            console.error("Failed to delete review:", err);
            setError("Could not delete review. Please try again.");
        }
        finally {
            setDeletingId(null);
        }
    };
    if (loading)
        return _jsx("p", { children: "Loading reviews..." });
    if (error)
        return _jsx("p", { className: "text-danger", children: error });
    if (reviews.length === 0)
        return _jsx("p", { children: "No reviews yet." });
    // Render the list of reviews
    return (_jsx("ul", { className: "list-group mt-3", children: reviews.map((review) => {
            // Check if the logged-in user wrote the review
            const isOwner = userId && userId === review.userId;
            const createdAt = review.createdAt?.toDate().toLocaleString() || "Unknown date";
            return (_jsx("li", { className: "list-group-item d-flex flex-column align-items-start gap-2", children: _jsxs("div", { className: "d-flex w-100 justify-content-between align-items-start flex-wrap", children: [_jsxs("div", { style: { minWidth: "60%" }, children: [_jsxs("div", { children: [renderStars(review.rating), " \u2014 ", review.comment] }), _jsxs("small", { className: "text-muted", children: ["By: ", review.userId.slice(0, 6), "... on ", createdAt] })] }), isOwner && (_jsx("div", { className: "text-end ms-auto", children: confirmDeleteId !== review.id ? (_jsx("button", { className: "btn btn-sm btn-outline-danger", onClick: () => setConfirmDeleteId(review.id), disabled: deletingId === review.id, children: "Delete" })) : (
                            // Show confirmation buttons if delete is requested
                            _jsxs("div", { className: "mt-2 text-end", children: [_jsx("p", { className: "mb-1 text-danger", children: "Delete this review?" }), _jsxs("div", { className: "d-flex justify-content-end gap-2", children: [_jsx("button", { className: "btn btn-sm btn-danger", onClick: () => handleDelete(review.id), disabled: deletingId === review.id, children: deletingId === review.id ? "Deleting..." : "Yes" }), _jsx("button", { className: "btn btn-sm btn-secondary", onClick: () => setConfirmDeleteId(null), disabled: deletingId === review.id, children: "Cancel" })] })] })) }))] }) }, review.id));
        }) }));
}
