import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useParams, useNavigate } from "react-router-dom"; // Import React Router hooks to get URL params and navigate programmatically
import { useEffect, useState } from "react"; // Import React hooks for side effects and state management
import { collection, onSnapshot, getDoc, doc, } from "firebase/firestore"; // Import Firestore functions for querying and listening to data
import { db } from "../firebase/firebase"; // Import Firestore database instance
// How many reviews to show per page
const reviewsPerPage = 5;
// Main component to display reviews for a product
const ReviewPage = () => {
    // Get the productId param from the URL
    const { productId } = useParams();
    // Function to change pages programmatically
    const navigate = useNavigate();
    // Local state variables to manage reviews data, loading/error states, pagination, sorting, rating filter, and mapping of user IDs to usernames.
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState("date");
    const [minRating, setMinRating] = useState(0);
    const [usernames, setUsernames] = useState({});
    // Calculate how many pages there are based on filtered reviews
    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
    // Slice reviews to only show those on the current page
    const paginatedReviews = filteredReviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);
    // Fetch reviews whenever the productId changes
    useEffect(() => {
        // If no productId in URL, show error and stop loading
        if (!productId) {
            setError("Invalid product ID.");
            setLoading(false);
            return;
        }
        // Reference to the reviews subcollection of the product
        const reviewsRef = collection(db, "products", productId, "reviews");
        // Listen for real-time updates from Firestore
        const unsubscribe = onSnapshot(reviewsRef, async (snapshot) => {
            // Convert each Firestore doc into Review object
            const fetched = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(), // Cast data to Review without id
            }));
            // Get unique userIds from reviews
            const uniqueUserIds = Array.from(new Set(fetched.map((review) => review.userId)));
            const newUsernames = {};
            // For each userId, fetch the username from users collection
            for (const userId of uniqueUserIds) {
                const userDoc = await getDoc(doc(db, "users", userId));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    // Use username or displayName or default to "User"
                    newUsernames[userId] = data.username || data.displayName || "User";
                }
                else {
                    // If user document missing, default to "Anonymous"
                    newUsernames[userId] = "Anonymous";
                }
            }
            setUsernames(newUsernames);
            setReviews(fetched);
            setLoading(false);
            setError(null);
        }, (err) => {
            console.error("Error fetching reviews:", err);
            setError("Failed to load reviews.");
            setLoading(false);
        });
        // Cleanup listener on unmount or productId change
        return () => unsubscribe();
    }, [productId]); // Run when productId changes
    // Whenever reviews, sort option, or rating filter change, update filtered reviews
    useEffect(() => {
        // Filter reviews by minimum rating
        const sorted = [...reviews].filter((review) => review.rating >= minRating);
        // Sort filtered reviews based on chosen option
        if (sortOption === "date") {
            // Newest first by createdAt timestamp
            sorted.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        }
        else if (sortOption === "rating") {
            // Highest rating first
            sorted.sort((a, b) => b.rating - a.rating);
        }
        else if (sortOption === "helpful") {
            // Most helpful first
            sorted.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        }
        // Update filtered list
        setFilteredReviews(sorted);
        setCurrentPage(1);
    }, [reviews, sortOption, minRating]); // Run when reviews, sort option, or minimum rating changes
    return (_jsxs("div", { className: "container py-4", children: [_jsx("h2", { className: "h4 fw-bold text-center mb-4", children: "Product Reviews" }), _jsxs("div", { className: "d-flex flex-wrap justify-content-center gap-3 mb-4", children: [_jsxs("select", { className: "form-select w-auto", value: sortOption, onChange: (e) => setSortOption(e.target.value), children: [_jsx("option", { value: "date", children: "Sort by Date (Newest)" }), _jsx("option", { value: "rating", children: "Sort by Rating (High \u2192 Low)" }), _jsx("option", { value: "helpful", children: "Sort by Most Helpful" })] }), _jsxs("select", { className: "form-select w-auto", value: minRating, onChange: (e) => setMinRating(Number(e.target.value)), children: [_jsx("option", { value: 0, children: "All Ratings" }), _jsx("option", { value: 4, children: "4\u2605 and above" }), _jsx("option", { value: 3, children: "3\u2605 and above" }), _jsx("option", { value: 2, children: "2\u2605 and above" })] })] }), loading ? (_jsx("p", { className: "text-center", children: "Loading reviews..." })) : error ? (_jsx("p", { className: "text-danger text-center", children: error })) : filteredReviews.length === 0 ? (_jsx("p", { className: "text-center", children: "No reviews match the criteria." })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "row justify-content-center", children: paginatedReviews.map((review) => (_jsx("div", { className: "col-12 col-md-10 col-lg-8 mb-4", children: _jsxs("div", { className: "bg-white rounded shadow-sm p-3 border border-light h-100", children: [_jsxs("div", { className: "d-flex align-items-center mb-2", children: [_jsx("span", { className: "text-warning me-2 fs-5", children: "\u2B50" }), _jsxs("span", { className: "fw-medium", children: [review.rating, "/5"] })] }), _jsx("p", { className: "mb-1 text-dark", children: review.comment }), _jsxs("p", { className: "text-muted small mb-0", children: ["By:", " ", usernames[review.userId]
                                                ? usernames[review.userId]
                                                : review.userId.slice(0, 6)] }), _jsx("p", { className: "text-secondary small", children: new Date(review.createdAt.seconds * 1000).toLocaleString() })] }) }, review.id))) }), totalPages > 1 && (_jsxs("div", { className: "d-flex justify-content-center align-items-center gap-3 mt-3", children: [_jsx("button", { className: "btn btn-primary", onClick: () => setCurrentPage((prev) => Math.max(prev - 1, 1)), disabled: currentPage === 1, children: "\u2B05\uFE0F Prev" }), _jsxs("span", { children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { className: "btn btn-primary", onClick: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)), disabled: currentPage === totalPages, children: "Next \u27A1\uFE0F" })] }))] })), _jsx("div", { className: "text-center pt-4", children: _jsx("button", { onClick: () => navigate("/"), className: "btn btn-primary rounded-pill fw-semibold px-4 py-2", children: "Back to Home" }) })] }));
};
// Export the ReviewPage component as the default export so it can be imported and used in other files.
export default ReviewPage;
