import { useState } from "react"; // Import useState hook to manage local component state
import { useNavigate } from "react-router-dom"; // Import useNavigate to redirect after logout
import { logoutUser } from "../redux/slices/authSlice"; // Import the logout thunk from Redux slice
import { useAppDispatch } from "../redux/hooks"; // Import the typed dispatch hook

// Define the LogoutButton component
export default function LogoutButton() {

 // Create a dispatch function to send actions to the Redux store
  const dispatch = useAppDispatch();

  // Hook to navigate programmatically
  const navigate = useNavigate();

  // Local states for handling logout loading state and error message
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define the function to handle user logout
  const handleLogout = async () => {
    setError(null);  
    setLoading(true);  

    try {
      // Run the logout action and wait for it to finish
      const resultAction = await dispatch(logoutUser());
 
       // Check if the logout action was rejected (failed)
      if (logoutUser.rejected.match(resultAction)) {

        // If the logout action failed, get the error message and show it.
        const errorMessage =
          resultAction.error?.message ?? "Failed to logout. Please try again.";
        console.error("Logout failed:", errorMessage);
        setError(errorMessage);
      } else {
        // If logout succeeded, redirect user to the login page.
        navigate("/login", { replace: true }); // Use replace to avoid back navigation to protected pages
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to logout. Please try again.";
      console.error("Logout failed:", errorMessage);
      setError(errorMessage);
    } finally {
        // Always turn off loading state when done.
      setLoading(false);
    }
  };

  return (
    <>
      {/* Logout button */}
      <button
        type="button"
        className="btn btn-outline-danger"
        onClick={handleLogout}
        disabled={loading}
        aria-disabled={loading}
        aria-live="polite"
      >
        {/* Show different text depending on loading state */}
        {loading ? "Logging out..." : "Logout"}
      </button>

      {/* Show error message if logout fails */}
      {error && (
        <div
          className="mt-2 text-danger"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          {error}
        </div>
      )}
    </>
  );
}