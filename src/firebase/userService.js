import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore"; // Import Firestore functions for document operations
import { deleteUser } from "firebase/auth"; // Import Firebase Auth function to delete user and User type for typing
import { db } from "./firebase"; // Import initialized Firestore database instance
// Function to get user profile data by UID from Firestore "users" collection
export const getUserProfile = async (uid) => {
    // Create a reference to the user document in Firestore
    const docRef = doc(db, "users", uid);
    // Fetch the document snapshot from Firestore
    const snapshot = await getDoc(docRef);
    // Return user data if document exists, otherwise return null
    return snapshot.exists() ? snapshot.data() : null;
};
// Function to create a new user profile document with name, email, and address
export const createUserProfile = async (uid, data) => {
    // Use setDoc to create or overwrite the user document in Firestore
    await setDoc(doc(db, "users", uid), data);
};
// Function to update an existing user profile partially (only name or address)
export const updateUserProfile = async (uid, data) => {
    // Update specified fields on the user document in Firestore
    await updateDoc(doc(db, "users", uid), data);
};
// Function to delete a user account, including Firestore doc and Firebase Auth user
export const deleteUserAccount = async (uid, user) => {
    try {
        // Delete the user document from Firestore
        await deleteDoc(doc(db, "users", uid));
        if (user) {
            // Delete the Firebase Authentication user account
            await deleteUser(user);
        }
        else {
            throw new Error("No authenticated user provided for deletion.");
        }
    }
    catch (error) {
        console.error("Failed to delete user account:", error);
        throw error;
    }
};
