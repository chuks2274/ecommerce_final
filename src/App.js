import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; // Import React Router components for routing and navigation
// Import route guards for private and admin routes
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
// Import main components and pages used in the app
import Navbar from "./components/Navbar";
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
import Footer from "./components/Footer";
import { AdminOrderManagement } from "./pages/admin/AdminOrderManagement";
import UserNotificationPage from "./pages/UserNotificationPage";
import ForgotPasswordEmail from "./pages/ForgotPasswordEmail";
// Import custom hooks and components for app-wide features
import { useUnreadNotifications } from "./hooks/useUnreadNotifications";
import AuthListener from "./components/AuthListener";
import CartAutoSave from "./components/CartAutoSave";
import "./App.css"; // Import global CSS styles for the app
// Main App component that defines routing and layout
function App() {
    // Get the number of unread notifications for the user
    const unreadCount = useUnreadNotifications();
    return (
    // Router enables client-side routing
    _jsx(Router, { children: _jsxs("div", { className: "app-container d-flex flex-column min-vh-100", children: [_jsx(AuthListener, {}), _jsx(CartAutoSave, {}), _jsx(Navbar, { unreadCount: unreadCount }), _jsx("main", { className: "flex-grow-1 main-content", style: { paddingTop: "70px" }, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/forgot-password-email", element: _jsx(ForgotPasswordEmail, {}) }), _jsx(Route, { path: "/reviews/:productId", element: _jsx(ReviewPage, {}) }), _jsx(Route, { path: "/cart", element: _jsx(PrivateRoute, { children: _jsx(Cart, {}) }) }), _jsx(Route, { path: "/orders", element: _jsx(PrivateRoute, { children: _jsx(OrderHistory, {}) }) }), _jsx(Route, { path: "/orders/:orderId", element: _jsx(PrivateRoute, { children: _jsx(OrderDetail, {}) }) }), _jsx(Route, { path: "/product/:id", element: _jsx(PrivateRoute, { children: _jsx(ProductDetail, {}) }) }), _jsx(Route, { path: "/order-success", element: _jsx(PrivateRoute, { children: _jsx(OrderSuccess, {}) }) }), _jsx(Route, { path: "/notifications", element: _jsx(PrivateRoute, { children: _jsx(UserNotificationPage, {}) }) }), _jsx(Route, { path: "/profile", element: _jsx(PrivateRoute, { children: _jsx(Profile, {}) }) }), _jsx(Route, { path: "/admin", element: _jsx(Navigate, { to: "/admin/manage-products", replace: true }) }), _jsx(Route, { path: "/admin/products", element: _jsx(AdminRoute, { children: _jsx(AdminProducts, {}) }) }), _jsx(Route, { path: "/admin/manage-products", element: _jsx(AdminRoute, { children: _jsx(ManageProductsPage, {}) }) }), _jsx(Route, { path: "/admin/add-product", element: _jsx(AdminRoute, { children: _jsx(AddProductPage, {}) }) }), _jsx(Route, { path: "/admin/orders", element: _jsx(AdminRoute, { children: _jsx(AdminOrderManagement, {}) }) })] }) }), _jsx(Footer, {})] }) }));
}
// Export App as the default export of the module
export default App;
