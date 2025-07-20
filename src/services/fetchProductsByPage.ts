import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore"; // Import useful Firestore functions for getting data and handling pagination
import { db } from "../firebase/firebase"; // Import the database instance we set up

// Define the structure of a product's rating with rate and count fields
interface Rating {
  rate: number;
  count: number;
}

// Define the structure of a product item from the database
export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  rating?: Rating;
}

// Define how many products we want per page
const PRODUCTS_PER_PAGE = 10;

// Function to load a page of products from Firestore with pagination support
export const fetchProductsByPage = async (
  
  // Function parameters for pagination and state setters
  page: number,
  pageStartDocsRef: React.MutableRefObject<
    QueryDocumentSnapshot<DocumentData>[]
  >,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setHasNextPage: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): Promise<void> => {
  setLoading(true);
  setError(null);

  try {
    // Get reference to the "products" collection in Firestore
    const productRef = collection(db, "products");
    let q; // This will hold our query

    if (page === 0) {
      // If it's the first page, start from the beginning
      q = query(productRef, orderBy("title"), limit(PRODUCTS_PER_PAGE + 1));
    } else {
      // Otherwise, get the last document from the previous page
      const lastDoc = pageStartDocsRef.current[page - 1];

      // If it's missing, we can't continue (shows error)
      if (!lastDoc) {
        setError("Pagination error: missing reference to previous page.");
        setLoading(false);
        return;
      }
    // Start the query after the last document from the previous page to paginate
      q = query(
        productRef,
        orderBy("title"),
        startAfter(lastDoc),
        limit(PRODUCTS_PER_PAGE + 1)
      );
    }
    // Get documents from Firestore using the query
    const snapshot = await getDocs(q);

    // Extract the array of documents from the snapshot
    const docs = snapshot.docs;

    // Check if there's a next page (based on if we got more than page size)
    const hasNext = docs.length === PRODUCTS_PER_PAGE + 1;

    // Remove the extra item if we have a next page
    const productsToShow = hasNext ? docs.slice(0, PRODUCTS_PER_PAGE) : docs;

    if (productsToShow.length > 0) {
      
      // Save the last doc of this page for the next page's reference
      pageStartDocsRef.current[page] =
        productsToShow[productsToShow.length - 1] as QueryDocumentSnapshot<DocumentData>;
    }
   // Convert raw Firestore documents to Product objects
    const newProducts = productsToShow.map((doc) => {

      // Get the product data from Firestore document
      const data = doc.data();

      // Ensure the rating object has numeric values, defaulting to 0 if missing
      const ratingFromData = data.rating ?? {};
      const rating: Rating = {
        rate: typeof ratingFromData.rate === "number" ? ratingFromData.rate : 0,
        count:
          typeof ratingFromData.count === "number" ? ratingFromData.count : 0,
      };
   // Return the product object including its ID and normalized rating
      return {
        id: doc.id,
        ...data,
        rating,
      };
    }) as Product[]; // Convert the mapped result to an array of Product for type safety

    // Update the UI state with the fetched products
    setProducts(newProducts);

     // Update the flag indicating whether there is a next page
    setHasNextPage(hasNext);

    // If something goes wrong, show error in console and to the user
  } catch (error) {
    console.error("Error fetching products:", error);
    setError("Failed to load products. Please try again.");
  } finally {
    setLoading(false);
  }
};