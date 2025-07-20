import { collection, addDoc, getDocs } from "firebase/firestore"; // Import functions to add documents, get collections from Firestore
import { db } from "./firebase"; // Import initialized Firestore database instance

// Define a TypeScript interface for product ratings
export interface Rating {
  rate: number;
  count: number;
}

// Define the shape of a product input when adding a new product (no ID yet)
export interface ProductInput {
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  createdBy?: string;
  rating?: Rating;
}

// Function to add a new product document to the "products" collection
export const addProduct = async (product: ProductInput) => {
  try {
    // Add the product to the "products" collection and get a reference to the new document
    const docRef = await addDoc(collection(db, "products"), product);

    console.log("Product added with ID:", docRef.id);

    // Return the ID of the newly added product document
    return docRef.id;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

// Fetch all product documents from the Firestore "products" collection
export const fetchProducts = async () => {

  // Get all documents from the "products" collection
  const querySnapshot = await getDocs(collection(db, "products"));

  // Map over docs to return an array with id and data combined
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Fetch unique product categories from Firestore, converted to lowercase
export const fetchCategories = async (): Promise<string[]> => {

  // Get all products from Firestore
  const querySnapshot = await getDocs(collection(db, "products"));

  // Use a Set to store unique categories without duplicates
  const categorySet = new Set<string>();

  // Loop through each document and get its data
  querySnapshot.forEach((doc) => {
    const data = doc.data();

    // If category field exists and is a string, add lowercase category to the Set
    if (data.category && typeof data.category === "string") {
      categorySet.add(data.category.toLowerCase());
    }
  });

  // Convert the set of unique categories to an array and return it
  return Array.from(categorySet);
};
