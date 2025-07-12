import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState, useRef } from "react"; // Import React hooks to handle memoized values, state, and DOM references
import { Link, useNavigate } from "react-router-dom"; // Import React Router components to handle navigation
import { useSelector, useDispatch } from "react-redux"; // Import Redux hooks to read global state and dispatch actions
import { logoutUser } from "../redux/slices/authSlice"; // Import logout action from auth slice
import { FaShoppingCart } from "react-icons/fa"; // Import shopping cart icon
import { NavDropdown } from "react-bootstrap"; // Import Bootstrap's NavDropdown component
import "./components.css"; // Import CSS for styling the component
// Main component definition
export default function Navbar({ unreadCount }) {
    // Get current user info from Redux store
    const user = useSelector((state) => state.auth.user);
    // Get items in cart from Redux store
    const cartItems = useSelector((state) => state.cart.items);
    // Calculate total items in cart using useMemo to optimize performance
    const cartCount = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems] // Run when cartItems changes
    );
    // Get the Redux dispatch function to send actions
    const dispatch = useDispatch();
    // Hook to navigate programmatically
    const navigate = useNavigate();
    // Local state to track logout error message
    const [logoutError, setLogoutError] = useState("");
    // Ref to the collapsible menu element (used to programmatically close it)
    const collapseRef = useRef(null);
    // Function to handle user logout
    const handleLogout = async () => {
        setLogoutError("");
        try {
            // Dispatch logout and unwrap promise
            await dispatch(logoutUser()).unwrap();
            navigate("/login");
            closeCollapse();
        }
        catch (error) {
            console.error("Logout failed:", error);
            setLogoutError("Logout failed. Please try again.");
        }
    };
    // Function to close the collapsible navbar (mobile view)
    const closeCollapse = () => {
        const collapseEl = collapseRef.current;
        if (collapseEl && collapseEl.classList.contains("show")) {
            collapseEl.classList.remove("show");
            collapseEl.setAttribute("aria-expanded", "false");
        }
    };
    // Call this function whenever a nav link is clicked (to close the menu)
    const handleNavLinkClick = () => {
        closeCollapse();
    };
    return (_jsxs("nav", { className: "navbar fixed-top navbar-expand-lg navbar-light shadow-sm", role: "navigation", children: [_jsxs("div", { className: "container-fluid px-3", children: [_jsx(Link, { to: "/", className: "navbar-brand fw-bold text-primary nav-hover", "aria-label": "M.C Boutique Home", onClick: handleNavLinkClick, children: "\uD83D\uDECD\uFE0F M.C Boutique" }), _jsx("button", { className: "navbar-toggler", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#navbarNavAltMarkup", "aria-controls": "navbarNavAltMarkup", "aria-expanded": "false", "aria-label": "Toggle navigation menu", children: _jsx("span", { className: "navbar-toggler-icon" }) }), _jsx("div", { className: "collapse navbar-collapse", id: "navbarNavAltMarkup", ref: collapseRef, children: _jsxs("div", { className: "navbar-nav ms-auto align-items-lg-center", children: [_jsx(Link, { to: "/", className: "nav-link nav-hover", "aria-current": "page", onClick: handleNavLinkClick, children: "Home" }), user && (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/profile", className: "nav-link nav-hover", onClick: handleNavLinkClick, children: "Profile" }), _jsxs(Link, { to: "/cart", className: "nav-link nav-hover position-relative d-inline-flex align-items-center mx-lg-2", "aria-label": `Cart with ${cartCount} items`, style: { minWidth: "auto" }, onClick: handleNavLinkClick, children: [_jsxs("div", { style: { position: "relative", display: "inline-block" }, children: [_jsx(FaShoppingCart, { size: 18 }), cartCount > 0 && (_jsxs("span", { className: "badge rounded-pill bg-danger", style: {
                                                                fontSize: "0.9rem",
                                                                position: "absolute",
                                                                top: "-6px",
                                                                right: "-10px",
                                                                lineHeight: "1",
                                                                padding: "2px 6px",
                                                            }, children: [cartCount, _jsx("span", { className: "visually-hidden", children: "items in cart" })] }))] }), _jsx("span", { className: "ms-2 d-none d-sm-inline", children: "Cart" })] }), _jsx(Link, { to: "/orders", className: "nav-link nav-hover", onClick: handleNavLinkClick, children: "My Orders" }), _jsx(Link, { to: "/notifications", className: "nav-link nav-hover notification-link", "aria-label": `Notifications (${unreadCount} unread)`, onClick: handleNavLinkClick, children: _jsxs("div", { className: "position-relative d-inline-flex align-items-center", children: [_jsx("span", { className: "notification-icon", "aria-hidden": "true", children: "\uD83D\uDD14" }), _jsx("span", { className: "notification-text d-none d-sm-inline", children: "Notifications" }), unreadCount > 0 && (_jsxs("span", { className: "badge rounded-pill bg-danger notification-badge", children: [unreadCount, _jsx("span", { className: "visually-hidden", children: "unread notifications" })] }))] }) })] })), user?.role === "admin" && (_jsxs(NavDropdown, { title: "Admin", id: "admin-dropdown", className: "nav-hover text-danger", children: [_jsx(NavDropdown.Item, { as: Link, to: "/admin/add-product", onClick: handleNavLinkClick, children: "\u2795 Add Product" }), _jsx(NavDropdown.Item, { as: Link, to: "/admin/manage-products", onClick: handleNavLinkClick, children: "\uD83D\uDEE0\uFE0F Manage Products" }), _jsx(NavDropdown.Item, { as: Link, to: "/admin/orders", onClick: handleNavLinkClick, children: "\uD83D\uDCE6 Manage Orders" })] })), user ? (_jsxs(_Fragment, { children: [_jsxs("span", { className: "nav-link", "aria-label": `Hello, ${user.name || "Admin"}`, children: ["Hello, ", user.name || "Admin", " \uD83D\uDC4B"] }), _jsx("button", { onClick: () => {
                                                handleLogout();
                                                closeCollapse();
                                            }, className: "btn btn-outline-danger btn-sm mt-2 mt-lg-0 ms-lg-2", style: {
                                                maxWidth: "100px",
                                                fontSize: "0.85rem",
                                                padding: "4px 8px",
                                                whiteSpace: "nowrap",
                                            }, children: "Logout" })] })) : (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/login", className: "nav-link nav-hover", onClick: handleNavLinkClick, children: "Login" }), _jsx(Link, { to: "/register", className: "nav-link nav-hover", onClick: handleNavLinkClick, children: "Register" })] }))] }) })] }), logoutError && (_jsx("div", { className: "alert alert-danger m-3", role: "alert", children: logoutError }))] }));
}
