import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit"; // Import Redux Toolkit functions to create slices, async actions, and typed action payloads
import { signOut } from "firebase/auth"; // Import Firebase Auth function to sign out a user
import { auth, db } from "../../firebase/firebase"; // Import configured Firebase Auth and Firestore database instances
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions to reference a document (doc) and fetch its data (getDoc)
import type { User as FirebaseUser } from "firebase/auth"; // Import the User type from Firebase Auth for TypeScript typing

// Define a user model that includes role info (admin or user)
export interface User {
  uid: string;
  email: string | null;
  name?: string;
  role?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// Define a user model that includes role info (admin or user)
export interface UserWithRole extends User {
  role: "admin" | "user";
}

// Define the shape of authentication state in Redux store
interface AuthState {
  user: UserWithRole | null;
  loading: boolean;
  error: string | null;
}

// Initial state for auth slice
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// Updated Async thunk to log out user with try/catch and logging
export const logoutUser = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    console.log("Signing out Firebase user...");
    await signOut(auth);
    console.log("Sign-out successful, dispatching clearAuth");
    thunkAPI.dispatch(clearAuth());
  } catch (error) {
    console.error("Logout error:", error);
    throw error;  
  }
});

// Async thunk to fetch extra user data from Firestore and return user with role (or null)
export const fetchAndSetUser = createAsyncThunk<
  UserWithRole | null,       
  FirebaseUser | null,       
  { rejectValue: string }   
>(
  "auth/fetchAndSetUser",
  async (firebaseUser, thunkAPI) => {
    if (!firebaseUser) return null;  

    try {
      // Reference Firestore doc for this user by UID
      const userDocRef = doc(db, "users", firebaseUser.uid);

      // Get the user document snapshot
      const userDocSnap = await getDoc(userDocRef);
 
      // Initialize user role, name, and timestamps with default or Firebase values
      let role: UserWithRole["role"] = "user";  
      let name: string | undefined = firebaseUser.displayName ?? undefined;
      let createdAt: string | null = null;
      let updatedAt: string | null = null;
 
      // Check if the user document exists in Firestore
      if (userDocSnap.exists()) {

        // Get user data from Firestore doc
        const userData = userDocSnap.data();

        // Check if role is valid and set it
        if (userData.role === "admin" || userData.role === "user") {
          role = userData.role;
        }

        // Check and assign optional user fields if they exist
        if (userData.name) name = userData.name;
        if (userData.createdAt?.toDate)
          createdAt = userData.createdAt.toDate().toISOString();
        if (userData.updatedAt?.toDate)
          updatedAt = userData.updatedAt.toDate().toISOString();
      }

      // Return user info with role and extra fields
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name,
        role,
        createdAt,
        updatedAt,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch user data";
      // Return rejected action with error message
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create the Redux slice for auth management
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Reducer to set user info in state
    setUser: (state, action: PayloadAction<UserWithRole | null>) => {
      state.user = action.payload;
    },
    // Reducer to update partial user data in state (for Firestore listener)
    updateUserData: (state, action: PayloadAction<Partial<UserWithRole>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // Reducer to set loading status
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // Reducer to set error message
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // Reducer to clear all auth info (logout state)
    clearAuth: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
   // Define additional reducers to handle async actions and lifecycle states
  extraReducers: (builder) => {
    builder
      // When logoutUser starts (pending), set loading true and clear errors
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // When logoutUser completes (fulfilled), clear loading (user cleared by clearAuth already)
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
      })
      // When logoutUser fails (rejected), set error and stop loading
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Logout failed";
      })
      // When fetchAndSetUser starts, set loading true and clear errors
      .addCase(fetchAndSetUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // When fetchAndSetUser succeeds, save user and stop loading
      .addCase(fetchAndSetUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      // When fetchAndSetUser fails, set error message and stop loading
      .addCase(fetchAndSetUser.rejected, (state, action) => {
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to fetch user data";
        state.loading = false;
      });
  },
});

// Export action creators from auth slice
export const { setUser, updateUserData, setLoading, setError, clearAuth } = authSlice.actions;

// Export the auth reducer for Redux store
export default authSlice.reducer;