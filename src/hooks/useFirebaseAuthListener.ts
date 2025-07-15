import { useEffect } from 'react'; // Import React hook to run code when component mounts/unmounts
import { onAuthStateChanged } from 'firebase/auth'; // Firebase function to listen for auth login/logout changes
import { useDispatch } from 'react-redux'; // Import Redux hook to dispatch actions
import { auth } from '../firebase/firebase'; // Import firebase auth instance
import { setUser, clearAuth } from '../redux/slices/authSlice'; //Import Redux actions to set or clear user info
import { fetchCart, clearCart } from '../redux/slices/cartSlice'; // Import Redux actions to fetch and clear cart
import type { AppDispatch } from '../redux/store'; // Import type definition for typed Redux dispatch

// Custom hook that sets up Firebase auth listener
const useFirebaseAuthListener = () => {

  // Get dispatch function to send actions to Redux store
  const dispatch = useDispatch<AppDispatch>();  

  // Run once on mount to start listening to auth changes
  useEffect(() => {
    // Listen for auth state changes (login/logout)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If user is logged in, get their info
        const { uid, email, displayName } = user;
      // Save user info to Redux store
        dispatch(
          setUser({
            uid,
            email: email ?? '',
            name: displayName ?? '',
            role: 'user',
          })
        );
       // Load the user's cart from Firestore
        dispatch(fetchCart(uid)); 
      } else {
        // If user logs out, clear auth and cart from Redux
        dispatch(clearAuth());   
        dispatch(clearCart());    
      }
    });
    // Cleanup the listener when component unmounts
    return () => unsubscribe();
  }, [dispatch]); // Run when dispatch changes

  return null;
};
// Export the custom hook
export default useFirebaseAuthListener;