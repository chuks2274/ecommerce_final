import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { AppDispatch } from "../redux/store";
import { clearCart, saveCart, type CartItem } from "../redux/slices/cartSlice";
import { createOrderAndNotify } from "../firebase/services/orderService";

// Async function to place an order with cart items and user ID
export const placeOrder = async (
  uid: string,
  cartItems: CartItem[],
  dispatch: AppDispatch
): Promise<void> => {
  try {
    // Calculate total price
    const total = cartItems.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    );

    // Calculate total quantity
    const totalQuantity = cartItems.reduce(
      (sum: number, item: CartItem) => sum + item.quantity,
      0
    );

    // Collect images
    const images = cartItems
      .map((item) => item.image)
      .filter((img): img is string => !!img);

    // Create order in Firestore
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

    // Notify admin users
    try {
      const itemSummaries = cartItems.map(
        (item) => `${item.title} $${item.price.toFixed(2)} × ${item.quantity}`
      );

      const adminMessage = `📦 New order ${orderId} placed by user ${uid}. Status: pending. Items: ${
        cartItems.length
      }, Quantity: ${totalQuantity}, Total: $${total.toFixed(
        2
      )}. Order details: ${itemSummaries.join(" | ")}`;

      const usersRef = collection(db, "users");
      const adminQuery = query(usersRef, where("role", "==", "admin"));
      const adminSnapshot = await getDocs(adminQuery);

      const adminNotifications = adminSnapshot.docs.map((adminDoc) =>
        addDoc(collection(db, "notifications"), {
          userId: adminDoc.id,
          message: adminMessage,
          images,
          createdAt: serverTimestamp(),
          read: false,
        })
      );

      await Promise.all(adminNotifications);
    } catch (err) {
      console.error("Failed to create admin notifications:", err);
    }

    // Clear cart in Redux and Firestore
    dispatch(clearCart());
    await dispatch(saveCart({ userId: uid, items: [] }));

    console.log("✅ Order placed, notifications sent, and cart cleared.");
  } catch (error) {
    console.error("❌ Failed to place order:", error);
    throw error;
  }
};
