import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";// Import routing components from React Router
import { useUnreadNotifications } from "./hooks/useUnreadNotifications"; // Import custom hook to get unread notifications
import useFirebaseAuthListener from "./hooks/useFirebaseAuthListener";  // Import Firebase auth listener hook to sync login/logout
// Import route guards for protecting pages
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
// Import shared layout components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartAutoSave from "./components/CartAutoSave";  // Import Auto-saves cart to Firestore
// Import public and protected pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import OrderHistory from "./pages/OrderHistory";
import ProductDetail from "./pages/ProductDetail";
import AdminProducts from "./pages/AdminProducts";
import ManageProductsPage from "./pages/admin/ManageProductsPage";
import AddProductPage from "./pages/admin/AddProductPage";
import OrderDetail from "./components/OrderDetail";
import OrderSuccess from "./pages/OrderSuccess";
import ReviewPage from "./pages/ReviewPage";
import UserNotificationPage from "./pages/UserNotificationPage";
import ForgotPasswordEmail from "./pages/ForgotPasswordEmail";
import { AdminOrderManagement } from "./pages/admin/AdminOrderManagement";
import "./App.css"; // Import global styles

// Main App component
function App() {
  
  // Start listening for Firebase auth changes (login/logout)
  useFirebaseAuthListener();

  // Get number of unread notifications
  const unreadCount = useUnreadNotifications();

  return (
    <Router>
      <div className="app-container d-flex flex-column min-vh-100">
        {/* Auto-save cart to Firestore on changes */}
        <CartAutoSave />

        {/* Global navigation bar */}
        <Navbar unreadCount={unreadCount} />

        <main className="flex-grow-1 main-content" style={{ paddingTop: "70px" }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password-email" element={<ForgotPasswordEmail />} />
            <Route path="/reviews/:productId" element={<ReviewPage />} />

            {/* Auth-protected routes */}
            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <OrderHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <PrivateRoute>
                  <OrderDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/product/:id"
              element={
                <PrivateRoute>
                  <ProductDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/order-success"
              element={
                <PrivateRoute>
                  <OrderSuccess />
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <UserNotificationPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Admin redirects & protected routes */}
            <Route path="/admin" element={<Navigate to="/admin/manage-products" replace />} />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/manage-products"
              element={
                <AdminRoute>
                  <ManageProductsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/add-product"
              element={
                <AdminRoute>
                  <AddProductPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrderManagement />
                </AdminRoute>
              }
            />
          </Routes>
        </main>

        {/* Footer always at the bottom */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;