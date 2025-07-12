import { collection, getDocs, query, orderBy, limit, startAfter, } from "firebase/firestore";
import { db } from "../firebase/firebase";
// Number of products to show per page
const PRODUCTS_PER_PAGE = 10;
// Fetch products from Firestore with pagination support
export const fetchProductsByPage = async (page, pageStartDocsRef, setProducts, setHasNextPage, setLoading, setError) => {
    setLoading(true);
    setError(null);
    try {
        const productRef = collection(db, "products");
        let q;
        if (page === 0) {
            q = query(productRef, orderBy("title"), limit(PRODUCTS_PER_PAGE + 1));
        }
        else {
            const lastDoc = pageStartDocsRef.current[page - 1];
            if (!lastDoc) {
                setError("Pagination error: missing reference to previous page.");
                setLoading(false);
                return;
            }
            q = query(productRef, orderBy("title"), startAfter(lastDoc), limit(PRODUCTS_PER_PAGE + 1));
        }
        const snapshot = await getDocs(q);
        const docs = snapshot.docs;
        const hasNext = docs.length === PRODUCTS_PER_PAGE + 1;
        const productsToShow = hasNext ? docs.slice(0, PRODUCTS_PER_PAGE) : docs;
        if (productsToShow.length > 0) {
            // ✅ Explicitly cast to correct type
            pageStartDocsRef.current[page] =
                productsToShow[productsToShow.length - 1];
        }
        const newProducts = productsToShow.map((doc) => {
            const data = doc.data();
            const ratingFromData = data.rating ?? {};
            const rating = {
                rate: typeof ratingFromData.rate === "number" ? ratingFromData.rate : 0,
                count: typeof ratingFromData.count === "number" ? ratingFromData.count : 0,
            };
            return {
                id: doc.id,
                ...data,
                rating,
            };
        });
        setProducts(newProducts);
        setHasNextPage(hasNext);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again.");
    }
    finally {
        setLoading(false);
    }
};
