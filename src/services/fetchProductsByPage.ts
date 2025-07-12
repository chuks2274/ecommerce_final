import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// Define the structure of a product's rating
interface Rating {
  rate: number;
  count: number;
}

// Define the structure of a product
export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  rating?: Rating;
}

// Number of products to show per page
const PRODUCTS_PER_PAGE = 10;

// Fetch products from Firestore with pagination support
export const fetchProductsByPage = async (
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
    const productRef = collection(db, "products");
    let q;

    if (page === 0) {
      q = query(productRef, orderBy("title"), limit(PRODUCTS_PER_PAGE + 1));
    } else {
      const lastDoc = pageStartDocsRef.current[page - 1];

      if (!lastDoc) {
        setError("Pagination error: missing reference to previous page.");
        setLoading(false);
        return;
      }

      q = query(
        productRef,
        orderBy("title"),
        startAfter(lastDoc),
        limit(PRODUCTS_PER_PAGE + 1)
      );
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    const hasNext = docs.length === PRODUCTS_PER_PAGE + 1;
    const productsToShow = hasNext ? docs.slice(0, PRODUCTS_PER_PAGE) : docs;

    if (productsToShow.length > 0) {
      // ✅ Explicitly cast to correct type
      pageStartDocsRef.current[page] =
        productsToShow[productsToShow.length - 1] as QueryDocumentSnapshot<DocumentData>;
    }

    const newProducts = productsToShow.map((doc) => {
      const data = doc.data();

      const ratingFromData = data.rating ?? {};
      const rating: Rating = {
        rate: typeof ratingFromData.rate === "number" ? ratingFromData.rate : 0,
        count:
          typeof ratingFromData.count === "number" ? ratingFromData.count : 0,
      };

      return {
        id: doc.id,
        ...data,
        rating,
      };
    }) as Product[];

    setProducts(newProducts);
    setHasNextPage(hasNext);
  } catch (error) {
    console.error("Error fetching products:", error);
    setError("Failed to load products. Please try again.");
  } finally {
    setLoading(false);
  }
};