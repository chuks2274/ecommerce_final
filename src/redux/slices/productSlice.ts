import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"; // Import necessary functions from Redux Toolkit
import type { PayloadAction } from "@reduxjs/toolkit"; // Import type for typed Redux actions
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  type DocumentData,
  QuerySnapshot,
} from "firebase/firestore"; // Import Firestore functions from Firebase
import { db } from "../../firebase/firebase"; // Import Firestore database instance
import { type Product } from "../../types"; // Import the Product type that includes id and optional description

// Define the structure of the product slice state
interface ProductState {
  items: Product[];
  loading: boolean;
  error: string | null;
  search: string;
  category: string;
}

// Set the initial state for the product slice
const initialState: ProductState = {
  items: [],
  loading: false,
  error: null,
  search: "",
  category: "all",
};

// Async thunk to fetch all products from Firestore
export const loadProducts = createAsyncThunk("products/load", async () => {

  // Get all products from the Firestore "products" collection
  const snapshot: QuerySnapshot<DocumentData> = await getDocs(
    collection(db, "products")
  );

  // Map Firestore documents to a Product array, including each doc's ID and data
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
});

// Async thunk to create a new product in Firestore (takes a product object without 'id')
export const createProduct = createAsyncThunk(
  "products/create",
  async (product: Omit<Product, "id">) => {

    // Add a new product document to the Firestore "products" collection
    const docRef = await addDoc(collection(db, "products"), product);

    // Return the product object including the Firestore-generated ID
    return { id: docRef.id, ...product };
  }
);

// Async thunk to update an existing product in Firestore (expects full Product with ID)
export const updateProduct = createAsyncThunk(
  "products/update",
  async (product: Product) => {

    // Get a reference to the product document in Firestore by its ID
    const docRef = doc(db, "products", product.id);

    // Update the specified fields in the Firestore product document
    await updateDoc(docRef, {
      title: product.title,
      price: product.price,
      category: product.category,
      image: product.image,
      description: product.description || "",
    });
    // Return the updated product object
    return product;
  }
);

 // Async thunk to delete a product from Firestore by its ID
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id: string) => {

    // Get a reference to the product document in Firestore by its ID
    const docRef = doc(db, "products", id);

    // Delete the product document from Firestore
    await deleteDoc(docRef);

    // Return the ID of the deleted product
    return id;
  }
);

// Create a Redux slice to manage product state and reducers
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // Update the search string in the product state
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    // Clear the search string by setting it to an empty string
    clearSearch(state) {
      state.search = "";
    },
    // Update the category filter in the product state
    setCategory(state, action: PayloadAction<string>) {
      state.category = action.payload;
    },
    // Clear the category filter by resetting it to "all"
    clearCategory(state) {
      state.category = "all";
    },
  },
  // Add handlers for actions defined outside the slice's normal reducers (such as async thunk actions)
  extraReducers: (builder) => {
    builder
      // When the product loading begins (pending state)
      .addCase(loadProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // When loading products succeeds (fulfilled state)
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      // When loading products fails (rejected state)
      .addCase(loadProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load products";
      })
     // When a new product is successfully created (fulfilled state)
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // When a product update succeeds (fulfilled state)
      .addCase(updateProduct.fulfilled, (state, action) => {
        // Find the index of the updated product in the items array
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // When a product deletion succeeds (fulfilled state)
      .addCase(deleteProduct.fulfilled, (state, action) => {
        // Remove the deleted product from the items array by filtering it out
        state.items = state.items.filter((p) => p.id !== action.payload);
      });
  },
});

// Export synchronous action creators from the product slice
export const { setSearch, clearSearch, setCategory, clearCategory } =
  productSlice.actions;

// Export the reducer function to be used in the Redux store
export default productSlice.reducer;
