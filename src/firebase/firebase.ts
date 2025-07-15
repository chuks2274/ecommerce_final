import { initializeApp, getApps, getApp } from "firebase/app"; // Import functions to initialize or get Firebase app
import { getAuth } from "firebase/auth"; // Import function to get Firebase authentication service
import { getFirestore } from "firebase/firestore";  // Import function to get Firestore database service
import { firebaseEnv } from "../config/env"; // Import Firebase config variables from env file

// Create config object from environment variables
const firebaseConfig = { ...firebaseEnv };

// Initialize Firebase app only if none exists yet, otherwise get the existing app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export the Firebase authentication instance connected to the app
export const auth = getAuth(app);

// Export the Firestore database instance connected to the app
export const db = getFirestore(app);

// Export the Firebase app instance
export { app };