import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseEnv } from "../config/env";
const firebaseConfig = { ...firebaseEnv };
// ✅ Only initialize Firebase if it hasn't already been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
