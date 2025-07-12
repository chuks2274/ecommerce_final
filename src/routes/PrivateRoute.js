import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from "react-router-dom"; // Import Navigate component to redirect users
import { useAppSelector } from "../redux/hooks"; // Import the typed useAppSelector hook
// PrivateRoute component to protect routes for authenticated users only
export default function PrivateRoute({ children }) {
    // Get current user from Redux store
    const user = useAppSelector((state) => state.auth.user);
    // If user is not logged in, redirect to login page
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    // If user is logged in, render the protected children components
    return _jsx(_Fragment, { children: children });
}
