import { useEffect, useState, useRef } from "react";// Import required hooks from React
import { onAuthStateChanged } from "firebase/auth"; // Import Firebase authentication method
import { auth, db } from "../firebase/firebase"; // Import initialized Firebase auth and Firestore database
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks for dispatching actions and selecting state
import { doc, getDoc, onSnapshot } from "firebase/firestore";// Import firestore functions to read document data and listen for real-time changes
import { setUser, clearAuth, updateUserData } from "../redux/slices/authSlice"; // Import auth actions: login, logout, and live updates
import { setCartItems } from "../redux/slices/cartSlice"; // Import action to update cart items in Redux
import { loadCartFromFirestore } from "../firebase/services/cartService";// Import custom service to load cart items from Firestore
import type { AppDispatch, RootState } from "../redux/store"; // Import types for Redux dispatch and state
import { AuthContext } from "./AuthContext"; // Import context used to share auth loading state with other components

// This component wraps your app and handles login state, user data, and cart data.
export function AuthProvider({ children }: { children: React.ReactNode }) {

 // Dispatch function to send actions to the Redux store
  const dispatch = useDispatch<AppDispatch>();

   // State to show if auth is loading
  const [loading, setLoading] = useState(true);

  // Used to store Firestore listener function
  const unsubscribeRef = useRef<() => void>(() => {});

  // Get the current user's UID from Redux state
  const userUid = useSelector((state: RootState) => state.auth.user?.uid);

  // useEffect to handle auth state change (user logs in or out)
  useEffect(() => {
     // Firebase method that sets up a listener for login or logout changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Try to fetch the user's document from Firestore using their UID
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (!userDoc.exists()) {
            console.error("User document not found.");
            setLoading(false);
            return;
          }
            // Get the user data from the Firestore document.
          const userData = userDoc.data();
         // Update Redux store with current user info, ensuring data is valid and formatted correctly
          dispatch(
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: typeof userData?.name === "string" ? userData.name : undefined,
              role:
                userData?.role === "admin" || userData?.role === "user"
                  ? userData.role
                  : "user",
              createdAt: userData?.createdAt
                ? userData.createdAt.toDate().toISOString()
                : undefined,
              updatedAt: userData?.updatedAt
                ? userData.updatedAt.toDate().toISOString()
                : undefined,
            })
          );
         // Fetch the user's saved cart items from Firestore using their UID
          const savedCart = await loadCartFromFirestore(firebaseUser.uid);

          // Update Redux store with the user's cart items
          dispatch(setCartItems(savedCart));
        } catch (error) {
          console.error("Error loading user or cart data", error);

          // Dispatch action to set basic user info in Redux with default role
          dispatch(
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName ?? undefined,
              role: "user",
            })
          );
          // Dispatch action to clear the cart items in Redux store (set to empty)
          dispatch(setCartItems([]));
        }
      } else {
        // Dispatch action to Redux store to clear user info and empty the cart
        dispatch(clearAuth());
        dispatch(setCartItems([]));

        // Call and reset the stored unsubscribe function to stop Firestore listener safely
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = () => {};
        }
      }

      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup the auth state listener when the component unmounts

  }, [dispatch]); // Run once when component mounts 

  // useEffect to listen for real-time changes in user document (like name or role update)
  useEffect(() => {
    // Only proceed if userUid is a valid string
    if (typeof userUid !== "string" || !userUid.trim()) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = () => {};
      }
      return;
    }

     // Get reference to user's document in Firestore
    const userDocRef = doc(db, "users", userUid);

    // Listen to real-time updates to the user's document
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        try {
          if (docSnap.exists()) {
             // If the document exists, get its data, validate fields, format timestamps, and update Redux store with the user info
            const raw = docSnap.data();
            dispatch(
              updateUserData({
                name: typeof raw.name === "string" ? raw.name : undefined,
                role: raw.role === "admin" || raw.role === "user" ? raw.role : undefined,
                createdAt: raw.createdAt
                  ? raw.createdAt.toDate().toISOString()
                  : undefined,
                updatedAt: raw.updatedAt
                  ? raw.updatedAt.toDate().toISOString()
                  : undefined,
              })
            );
          }
        } catch (error) {
          console.error("Error handling Firestore snapshot:", error);
        }
      },
      (error) => {
        console.error("Snapshot listener failed:", error);
      }
    );
   // Save the unsubscribe function
    unsubscribeRef.current = unsubscribe;

  // Cleanup listener when component or userUid changes
    return () => {
      unsubscribe();
      unsubscribeRef.current = () => {};
    };
  }, [userUid, dispatch]); // Run when userUid or dispatch changes

  // Show a loading message while checking login status; once done, provide auth context to children
  if (loading) return <p className="text-center mt-5">Checking login...</p>;
  return <AuthContext.Provider value={{ loading }}>{children}</AuthContext.Provider>;
}