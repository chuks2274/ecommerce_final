import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase function to sign in users with email and password
import { auth, db } from "../firebase/firebase"; // Import Firebase authentication and database instances
import { doc, getDoc } from "firebase/firestore"; // Import functions to get a user document from Firestore
import { useNavigate, Link } from "react-router-dom"; // Import React Router tools for navigation and linking
import { useDispatch } from "react-redux"; // Import Redux hook to dispatch actions
import { setUser } from "../redux/slices/authSlice"; // Import action to update the user info in the Redux store
import { useState } from "react"; // Import React hook to manage component state
// Login component
export default function Login() {
    // Local state for user credentials, error message, and loading status during login
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    // Function to change pages programmatically
    const navigate = useNavigate();
    // Set up dispatch function to send actions to Redux store
    const dispatch = useDispatch();
    // Function to handle login process
    const handleLogin = async () => {
        setErrorMessage(null);
        // Check if both fields are filled
        if (!email.trim() || !password) {
            setErrorMessage("Both email and password are required.");
            return;
        }
        setLoading(true);
        try {
            // Sign in using Firebase auth
            const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
            const firebaseUser = userCred.user;
            // Get the user's extra profile info from Firestore
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            // If the document doesn't exist, show error
            if (!userDocSnap.exists()) {
                setErrorMessage("User profile data not found.");
                setLoading(false);
                return;
            }
            // Get the user data from Firestore
            const userData = userDocSnap.data();
            // Save the UID in localStorage so we can use it later
            localStorage.setItem("userUid", firebaseUser.uid);
            // Create a full user object including role
            const fullUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: userData.name ?? null,
                role: userData.role ?? "user",
            };
            // Save the user info in Redux store
            dispatch(setUser(fullUser));
            setLoading(false);
            // Redirect based on user role
            navigate(fullUser.role === "admin" ? "/admin" : "/");
        }
        catch (error) {
            // Handle login errors
            if (error instanceof Error) {
                setErrorMessage("Login failed: " + error.message);
            }
            else {
                setErrorMessage("An unknown error occurred during login.");
            }
            setLoading(false);
        }
    };
    // JSX to render the login form
    return (_jsx("div", { className: "d-flex justify-content-center align-items-center", style: { minHeight: "80vh", padding: "1rem" }, children: _jsxs("div", { className: "w-100 rounded shadow-sm p-4", style: {
                maxWidth: "400px",
                backgroundColor: "#A3C1AD",
                border: "1px solid #ddd",
            }, children: [_jsx("h2", { className: "text-center mb-4", children: "Login" }), errorMessage && (_jsx("div", { className: "alert alert-danger", role: "alert", children: errorMessage })), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { htmlFor: "emailInput", className: "form-label", children: ["Email address ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("input", { id: "emailInput", type: "email", className: "form-control", placeholder: "Enter email", value: email, onChange: (e) => setEmail(e.target.value), disabled: loading, autoComplete: "username" })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { htmlFor: "passwordInput", className: "form-label", children: ["Password ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("input", { id: "passwordInput", type: "password", className: "form-control", placeholder: "Enter password", value: password, onChange: (e) => setPassword(e.target.value), disabled: loading, autoComplete: "current-password" })] }), _jsx("div", { className: "text-end mb-3", children: _jsx(Link, { to: "/forgot-password-email", className: "text-decoration-none", children: "Forgot Password?" }) }), _jsx("div", { className: "d-flex justify-content-center mt-3", children: _jsx("button", { className: "btn btn-primary", onClick: handleLogin, disabled: loading, "aria-busy": loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status", "aria-hidden": "true" }), "Logging in..."] })) : ("Login") }) })] }) }));
}
