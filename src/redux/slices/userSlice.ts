import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"; // Import functions to create Redux slice and async thunks
import type { PayloadAction } from "@reduxjs/toolkit"; // Import type for Redux action payloads
import {
  updateProfile,
  deleteUser,
  type User,  
} from "firebase/auth"; // Import Firebase Auth functions and User type
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore"; // Import Firestore functions
import { auth, db } from "../../firebase/firebase"; // Import Firebase authentication and Firestore database instances

// Define the structure of user profile data
interface ProfileData {
  name: string;
  address: string;
  email?: string;
  createdAt?: string;  
}

// Define the shape of the user slice state
interface UserState {
  profile: ProfileData | null;  
  loading: boolean;             
  error: string | null;        
  success: string | null;       
}

// Initial state for the user slice
const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
  success: null,
};

 

// Async thunk to fetch a user's profile data from Firestore
export const fetchUserProfile = createAsyncThunk<
  ProfileData,
  string,                
  { rejectValue: string }
>(
  "user/fetchUserProfile",
  // Async function to fetch user profile by UID
  async (uid, { rejectWithValue }) => {
    try {
      // Get a reference to the user document in Firestore using the UID
      const docRef = doc(db, "users", uid);

      // Get the user document snapshot from Firestore
      const docSnap = await getDoc(docRef);

      // If document doesn't exist, reject with error
      if (!docSnap.exists()) {
        return rejectWithValue("Profile does not exist.");
      }
      // Get the document data from the snapshot
      const data = docSnap.data();

      // Return profile data with createdAt converted to an ISO string
      return {
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : undefined,
      } as ProfileData;
    } catch {
      return rejectWithValue("Failed to fetch profile.");
    }
  }
);

// Async thunk to update user profile in Firebase Auth and Firestore
export const editUserProfile = createAsyncThunk<
  ProfileData,
  { uid: string; data: ProfileData },    
  { rejectValue: string }
>(
  "user/editUserProfile",
  // Async function to update user profile using UID and new data
  async ({ uid, data }, { rejectWithValue }) => {
    try {
      // Get the currently authenticated user from Firebase Auth
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      // Update Firebase Auth displayName only if it differs from data.name
      if (data.name !== user.displayName) {
        await updateProfile(user, { displayName: data.name });
      }

      // Get a reference to the user document in Firestore
      const userDocRef = doc(db, "users", uid);

      // Update user doc data with merge to avoid overwriting
      await setDoc(userDocRef, data, { merge: true });

      // Return the updated profile data
      return data;
    } catch {
      return rejectWithValue("Failed to update profile.");
    }
  }
);

// Async thunk to delete a user account from Firebase Auth and Firestore
export const removeUserAccount = createAsyncThunk<
  void,
  { uid: string; user: User },    
  { rejectValue: string }
>(
  "user/removeUserAccount",
  // Async function to delete user by UID and user object
  async ({ uid, user }, { rejectWithValue }) => {
    try {
      // Delete the user document from Firestore
      await deleteDoc(doc(db, "users", uid));

      // Delete the user from Firebase Authentication
      await deleteUser(user);
    } catch {
      return rejectWithValue("Failed to delete account. You may need to re-login.");
    }
  }
);

// Create a Redux slice to manage user profile state
const userSlice = createSlice({
  name: "user",          
  initialState,           
  reducers: {
    // Clear error and success messages from the state
    clearMessages(state) {
      state.error = null;
      state.success = null;
    },
    // Clear user profile and reset loading, error, and success states
    clearUser(state) {
      state.profile = null;
      state.error = null;
      state.success = null;
      state.loading = false;
    },
  },
  // Add handlers for actions defined outside the slice's normal reducers (such as async thunk actions)
  extraReducers: (builder) => {
    builder
      // When fetching the user profile starts (pending state)
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;      
        state.error = null;       
        state.success = null;     
      })
      // When fetching the user profile succeeds (fulfilled state)
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<ProfileData>) => {
        state.loading = false;     
        state.profile = action.payload;  
      })
      // When fetching the user profile fails (rejected state)
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;     
        state.error = action.payload || "Failed to load profile";  
      })

      // When editing the user profile starts (pending state)
      .addCase(editUserProfile.pending, (state) => {
        state.loading = true;      
        state.error = null;       
        state.success = null;     
      })
      // When editing the user profile succeeds (fulfilled state)
      .addCase(editUserProfile.fulfilled, (state, action: PayloadAction<ProfileData>) => {
        state.loading = false;     
        state.profile = action.payload;  
        state.success = "Profile updated successfully.";  
      })
      // When editing the user profile fails (rejected state)
      .addCase(editUserProfile.rejected, (state, action) => {
        state.loading = false;     
        state.error = action.payload || "Failed to update profile";  
      })

      // When removing the user account starts (pending state)
      .addCase(removeUserAccount.pending, (state) => {
        state.loading = true;      
        state.error = null;       
        state.success = null;      
      })
      // When removing the user account succeeds (fulfilled state)
      .addCase(removeUserAccount.fulfilled, (state) => {
        state.loading = false;     
        state.profile = null;     
        state.success = "Account deleted successfully.";  
      })
      // When removing the user account fails (rejected state)
      .addCase(removeUserAccount.rejected, (state, action) => {
        state.loading = false;     
        state.error = action.payload || "Failed to delete account";  
      });
  },
});

// Export action creators for clearing messages and user profile
export const { clearMessages, clearUser } = userSlice.actions;

// Export the reducer function to be used in the Redux store
export default userSlice.reducer;