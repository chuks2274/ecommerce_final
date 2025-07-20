import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"; // Import necessary functions from Redux Toolkit
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  type DocumentData,
  updateDoc,
  doc,
} from "firebase/firestore"; // Import Firestore functions to interact with the database
import { db } from "../../firebase/firebase"; // Import the Firestore database configuration

// Define the shape of each item in an order
export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

// Define the structure of order items as stored in Firestore (raw data format)
interface RawOrderItem {
  id?: string;
  productId?: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

// Define the complete structure of an order in the application
export interface Order {
  id: string;
  userId: string;
  status: string;
  createdAt: string;
  total: number;
  items: OrderItem[];
  deliveryStatus: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  deliveryDate?: string;
}

// Define the shape of the Redux state slice for orders
export interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

// Initial state for the orders slice
const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
};

// Thunk to fetch all orders for a specific user
export const fetchOrdersByUser = createAsyncThunk(
  "orders/fetchOrdersByUser",
  async (userId: string) => {
    // Build a query to get orders by userId, ordered by date (newest first)
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    // Execute the query and get the documents
    const snapshot = await getDocs(q);

    // Convert raw data into a usable Order object
    return snapshot.docs.map((doc) => {
      const data = doc.data() as DocumentData;

      // Normalize the order items to ensure consistent structure and fallback values
      const normalizedItems: OrderItem[] = (data.items ?? []).map(
        (item: RawOrderItem) => ({
          id: item.id || item.productId || "",
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image || "",
        })
      );

      // Return the order object with normalized fields and Firestore timestamps converted to ISO strings
      return {
        id: doc.id,
        userId: data.userId,
        createdAt: data.createdAt?.seconds
          ? new Date(data.createdAt.seconds * 1000).toISOString()
          : "",
        total: data.total,
        items: normalizedItems,
        status: data.status ?? "Pending",
        deliveryStatus: data.deliveryStatus ?? "Pending",
        deliveryDate: data.deliveryDate?.seconds
          ? new Date(data.deliveryDate.seconds * 1000).toISOString()
          : undefined,
      } as Order;
    });
  }
);

// Thunk to create a new order
export const createOrder = createAsyncThunk(
  "orders/createOrder",

  // Async function that takes userId, order items, and total to create a new order
  async (payload: { userId: string; items: OrderItem[]; total: number }) => {
    const { userId, items, total } = payload;

    // Create a new order object with default status and timestamp to save in Firestore
    const newOrder = {
      userId,
      items,
      total,
      status: "Pending",
      createdAt: serverTimestamp(),
      deliveryStatus: "Pending",
    };

    // Add the new order object to the Firestore "orders" collection
    const docRef = await addDoc(collection(db, "orders"), newOrder);

    // Return the new order to be added to Redux state
    return {
      id: docRef.id,
      userId,
      items,
      total,
      status: "Pending",
      createdAt: new Date().toISOString(),
      deliveryStatus: "Pending",
    } as Order;
  }
);

// Thunk to update the delivery status of an existing order
export const updateDeliveryStatus = createAsyncThunk(
  "orders/updateDeliveryStatus",

  // Async function receiving orderId and new deliveryStatus to update the order’s delivery status
  async (payload: { orderId: string; status: Order["deliveryStatus"] }) => {
    const { orderId, status } = payload;

    // Set deliveryDate to server timestamp if status is "Delivered"; else null
    const deliveryDate = status === "Delivered" ? serverTimestamp() : null;

    // Update delivery status and date in Firestore order document
    await updateDoc(doc(db, "orders", orderId), {
      deliveryStatus: status,
      deliveryDate,
    });

    // Return the updated delivery status and date for Redux state update
    return {
      orderId,
      deliveryStatus: status,
      deliveryDate: deliveryDate ? new Date().toISOString() : undefined,
    };
  }
);

// Create the Redux slice for orders
const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  // Define extra reducers to handle async actions
  extraReducers: (builder) => {
    builder
      // Handle loading state when fetching orders
      .addCase(fetchOrdersByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Store fetched orders on success
      .addCase(fetchOrdersByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      // Set error if fetch fails
      .addCase(fetchOrdersByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch orders";
      })

      // Handle loading when creating an order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Add the new order to the state
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      // Handle error if create fails
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create order";
      })

      // When the delivery status update is successful, get the updated info and find the order in the state by its ID
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        const { orderId, deliveryStatus, deliveryDate } = action.payload;
        const order = state.orders.find((o) => o.id === orderId);

        // If the order exists, update its delivery status and delivery date (if provided)
        if (order) {
          order.deliveryStatus = deliveryStatus;
          if (deliveryDate) order.deliveryDate = deliveryDate;
        }
      });
  },
});

// Export the reducer function to be used in the Redux store
export default orderSlice.reducer;
