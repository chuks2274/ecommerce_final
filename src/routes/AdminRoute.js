import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from "react-router-dom"; // Import Navigate component to redirect users
import { useAppSelector } from "../redux/hooks"; // Import the typed useAppSelector hook for Redux state
// AdminRoute component protects routes for admin users only
export default function AdminRoute({ children }) {
    // Get current user from Redux store
    const rawUser = useAppSelector((state) => state.auth.user);
    // Get current loading state from Redux store
    const loading = useAppSelector((state) => state.auth.loading);
    // Narrow down rawUser type to UserWithRole if valid, else null
    const user = rawUser && typeof rawUser === "object" && "role" in rawUser
        ? rawUser
        : null;
    // Show loading message if auth state is still loading
    if (loading)
        return _jsx("div", { children: "Loading..." });
    // Redirect to login if not authenticated
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true });
    // Redirect to not-authorized if the user is not an admin
    if (user.role !== "admin")
        return _jsx(Navigate, { to: "/not-authorized", replace: true });
    // Render protected content if user is an admin
    return _jsx(_Fragment, { children: children });
}
