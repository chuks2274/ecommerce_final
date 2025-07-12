import { collection, addDoc, Timestamp } from "firebase/firestore"; // Import Firestore functions to add data and get timestamps
import { db } from "../firebase"; // Import the database instance so we can use Firestore
// This function creates an order and also sends a notification to the user
export async function createOrderAndNotify(orderData, userId, images = []) {
    try {
        // Add the new order to the "orders" collection in Firestore
        const orderRef = await addDoc(collection(db, "orders"), {
            ...orderData,
            userId,
            status: "pending",
            createdAt: Timestamp.now(),
        });
        // Add a new notification for the user in the "notifications" collection
        await addDoc(collection(db, "notifications"), {
            userId,
            message: `🎉 Your order ${orderRef.id} is now pending!`,
            type: "order",
            images,
            createdAt: Timestamp.now(),
            read: false,
        });
        // Return the ID of the new order so the app can show it or use it later
        return orderRef.id;
    }
    catch (error) {
        // If anything fails, log it and rethrow the error so calling code can handle it
        console.error("Failed to create order and notify:", error);
        throw error;
    }
}
