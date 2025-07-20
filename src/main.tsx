import { StrictMode } from 'react'; // Import StrictMode from React to help highlight potential problems in the app
import { createRoot } from 'react-dom/client'; // Import createRoot for React 18 root rendering API
import App from './App'; // Import main App component
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS styles for styling components
import './index.css'; // Import custom global CSS styles
import { Provider } from "react-redux"; // Import Redux Provider to connect React with Redux store
import { store } from "./redux/store"; // Import the configured Redux store
import { AuthProvider } from "./context/AuthProvider"; // Import custom AuthProvider context to handle user authentication state
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import Bootstrap JavaScript bundle for interactive components like modals, dropdowns, etc.

 // Create React root and render the app into the DOM element with id 'root'
createRoot(document.getElementById('root')!).render(
  
  <StrictMode>
    {/* Wrap the app with Redux Provider to give access to the Redux store */}
    <Provider store={store}>
     {/* Wrap the app with AuthProvider to provide authentication context and sync user state */}
      <AuthProvider> 
        <App />
      </AuthProvider>
    </Provider>
  </StrictMode>,
);