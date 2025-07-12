import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"; // Import necessary functions from Redux Toolkit
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, } from "firebase/firestore"; // Import Firestore functions from Firebase
import { db } from "../../firebase/firebase"; // Import Firestore database instance
// Initialize the product slice state
const initialState = {
    items: [],
    loading: false,
    error: null,
    search: "",
    category: "all",
};
// Async thunk to load all products from Firestore
export const loadProducts = createAsyncThunk("products/load", async () => {
    // Fetch all product documents from Firestore collection "products"
    const snapshot = await getDocs(collection(db, "products"));
    // Map Firestore docs to Product array including id and data
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
});
// Async thunk to create a new product (Firestore generates id)
export const createProduct = createAsyncThunk("products/create", async (product) => {
    // Add new product doc to Firestore "products" collection
    const docRef = await addDoc(collection(db, "products"), product);
    // Return product including generated id
    return { id: docRef.id, ...product };
});
// Async thunk to update an existing product
export const updateProduct = createAsyncThunk("products/update", async (product) => {
    // Reference the product doc in Firestore by id
    const docRef = doc(db, "products", product.id);
    // Update fields in Firestore document
    await updateDoc(docRef, {
        title: product.title,
        price: product.price,
        category: product.category,
        image: product.image,
        description: product.description || "",
    });
    // Return the updated product object
    return product;
});
// Async thunk to delete a product by id
export const deleteProduct = createAsyncThunk("products/delete", async (id) => {
    // Reference the product doc in Firestore by id
    const docRef = doc(db, "products", id);
    // Delete the Firestore document
    await deleteDoc(docRef);
    // Return the deleted product id
    return id;
});
// Create Redux slice for product state management
const productSlice = createSlice({
    name: "products",
    initialState,
    reducers: {
        // Set the search string in state
        setSearch(state, action) {
            state.search = action.payload;
        },
        // Clear the search string (set empty)
        clearSearch(state) {
            state.search = "";
        },
        // Set the category filter in state
        setCategory(state, action) {
            state.category = action.payload;
        },
        // Clear the category filter (reset to "all")
        clearCategory(state) {
            state.category = "all";
        },
    },
    extraReducers: (builder) => {
        builder
            // When loading products starts
            .addCase(loadProducts.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            // When loading products succeeds
            .addCase(loadProducts.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload;
        })
            // When loading products fails
            .addCase(loadProducts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "Failed to load products";
        })
            // When a new product is created successfully
            .addCase(createProduct.fulfilled, (state, action) => {
            state.items.push(action.payload);
        })
            // When a product is updated successfully
            .addCase(updateProduct.fulfilled, (state, action) => {
            // Find index of updated product in items array
            const index = state.items.findIndex((p) => p.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        })
            // When a product is deleted successfully
            .addCase(deleteProduct.fulfilled, (state, action) => {
            // Remove deleted product from state list by filtering
            state.items = state.items.filter((p) => p.id !== action.payload);
        });
    },
});
// Export synchronous action creators
export const { setSearch, clearSearch, setCategory, clearCategory } = productSlice.actions;
// Export the reducer function to be used in the Redux store
export default productSlice.reducer;
