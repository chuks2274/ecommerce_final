import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"; // Import Firestore functions to read, write, and manage collections/documents
import { db } from "../firebase/firebase"; // Import the Firestore database instance
import { AppDispatch } from "../redux/store"; // Import type for Redux dispatch
import { clearCart, saveCart, type CartItem } from "../redux/slices/cartSlice"; // Import actions and types from the cart slice
import { createOrderAndNotify } from "../firebase/services/orderService"; // Import function that creates the order and sends notifications

// Main function to place an order
export const placeOrder = async (
  uid: string,
  cartItems: CartItem[],
  dispatch: AppDispatch
): Promise<void> => {
  try {
    // Calculate total price of all items
    const total = cartItems.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    );
   // Calculate total quantity of items
    const totalQuantity = cartItems.reduce(
      (sum: number, item: CartItem) => sum + item.quantity,
      0
    );
  // Collect all item images  
    const images = cartItems
      .map((item) => item.image)
      .filter((img): img is string => !!img);

      // Call helper to create the order and send basic notification
    const orderId = await createOrderAndNotify(
      {
        items: cartItems.map((item) => ({
          productId: item.id,
          title: item.title,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
        })),
        total,
      },
      uid,
      images
    );

    try {
      // Build readable item descriptions for admin message
      const itemSummaries = cartItems.map(
        (item) => `${item.title} $${item.price.toFixed(2)} × ${item.quantity}`
      );
    // Compose full message for admins
      const adminMessage = `📦 New order ${orderId} placed by user ${uid}. Status: pending. Items: ${
        cartItems.length
      }, Quantity: ${totalQuantity}, Total: $${total.toFixed(
        2
      )}. Order details: ${itemSummaries.join(" | ")}`;

     // Get reference to users collection
      const usersRef = collection(db, "users");

        // Create a query to find all users with role "admin"
      const adminQuery = query(usersRef, where("role", "==", "admin"));

       // Run the query to get admin documents
      const adminSnapshot = await getDocs(adminQuery);

       // For each admin, send a notification
      const adminNotifications = adminSnapshot.docs.map(async (adminDoc) => {
        try {
          await addDoc(collection(db, "notifications"), {
            userId: adminDoc.id,
            message: adminMessage,
            images,
            createdAt: serverTimestamp(),
            read: false,
          });
        } catch (err) {
          console.error(`❌ Failed to notify admin ${adminDoc.id}:`, err);
        }
      });
    // Wait for all admin notifications to finish sending
      await Promise.all(adminNotifications);
    } catch (err) {
      console.error("❌ Failed to create admin notifications:", err);
    }
  // Clear the cart from Redux store
    dispatch(clearCart());

    try {
      // Save an empty cart to Firestore to overwrite previous one
      await dispatch(saveCart({ userId: uid, items: [] }));
    } catch (err) {
      console.error("❌ Failed to save cleared cart:", err);
    }

  } catch (error) {
    console.error("❌ Failed to place order:", error);
    throw error;
  }
};