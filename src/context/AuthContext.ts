import { createContext } from "react"; // Import createContext function from React library


// Create a context to share loading state (e.g. checking login) with other components
export const AuthContext = createContext<{ loading: boolean }>({
  loading: true,
});