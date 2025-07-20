import { doc, getDoc, setDoc } from "firebase/firestore"; // Import functions to work with Firestore: get a doc, set a doc, create doc reference
import { db } from "../firebase"; // Import the Firestore database instance
import { CartItem } from "../../redux/slices/cartSlice"; // Import CartItem type definition 

// Save user's cart items to Firestore under their UID
export async function saveCartToFirestore(userId: string, items: CartItem[]) {
  if (!userId) return; // If no user ID, exit early

  try {
     // Save the items to the document with the user's ID inside the "carts" collection
    await setDoc(doc(db, "carts", userId), { items });
  } catch (err) {
    console.error("Failed to save cart:", err);
  }
}

// Load cart items from Firestore for a given user ID and return them as a promise that resolves to an array of cart items
export async function loadCartFromFirestore(userId: string): Promise<CartItem[]> {
  if (!userId) return []; // If no user ID, return an empty cart

  try {
    // Get the user's cart document from the "carts" collection
    const cartDoc = await getDoc(doc(db, "carts", userId));
    if (cartDoc.exists()) {
      // Return saved cart items or an empty array if items field is missing
      return cartDoc.data().items || [];
    }
  } catch (err) {
    console.error("Failed to load cart:", err);
  }
  // Return empty array if cart not found or error happened
  return [];
}