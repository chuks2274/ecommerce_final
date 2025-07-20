import { CartItem } from "../redux/slices/cartSlice"; // Import the CartItem type so we can use it for type checking

// This function merges two cart item arrays: one from local state and one from Firestore
export function mergeCarts(

  // Items from local Redux store before user login
  localItems: CartItem[],
  
  // Items from Firestore after user login
  firestoreItems: CartItem[]
): CartItem[] {
   // Create a map to store items using their ID as the key
  const map = new Map<string, CartItem>();

// Add all local cart items to the map
  localItems.forEach((item) => {
    map.set(item.id, { ...item });
  });
 // Loop through items from Firestore
  firestoreItems.forEach((item) => {
    if (map.has(item.id)) {
      // If item already exists in the map, add quantities together
      const existing = map.get(item.id)!;
      existing.quantity += item.quantity;
    } else {
       // If item doesn't exist, add it to the map
      map.set(item.id, { ...item });
    }
  });
  // Convert map values back to an array and return the merged cart
  return Array.from(map.values());
}