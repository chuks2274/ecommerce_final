import { collection, addDoc, Timestamp } from "firebase/firestore"; // Import Firestore functions to add data and get timestamps
import { db } from "../firebase"; // Import the database instance so we can use Firestore

// Describe the shape of a single item in an order
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

// Describe the shape of the full order
export interface OrderData {
  items: OrderItem[];
  total: number;
}

// Create a new order and notify the user, returning the order ID
export async function createOrderAndNotify(
  orderData: OrderData,
  userId: string,
  images: string[] = []
): Promise<string> {
  try {
    // Add a new order document to the "orders" collection with order data, user ID, status, and creation timestamp
    const orderRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      userId,
      status: "pending",
      createdAt: Timestamp.now(),
    });

    // Add a new notification document to the "notifications" collection with order info and read status
    await addDoc(collection(db, "notifications"), {
      userId,
      message: `🎉 Your order ${orderRef.id} is now pending!`,
      type: "order",
      images,
      createdAt: Timestamp.now(),
      read: false,
    });

    // Return the new order's ID so the app can display or reference it later
    return orderRef.id;

  } catch (error) {
    console.error("Failed to create order and notify:", error);
    throw error;
  }
}
