import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react"; // Import React hook for component state management
import { useNavigate } from "react-router-dom"; // Import navigation hook to programmatically redirect user
import { useDispatch } from "react-redux"; // Import Redux hook to dispatch actions
import { setUser } from "../redux/slices/authSlice"; // Import Redux action to set authenticated user in the store
import { auth, db } from "../firebase/firebase"; // Import Firebase auth and database configuration
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"; // Import Firebase auth functions to create users and update profiles
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // Import Firestore functions to set documents and timestamps
// Async function to register a new user in Firebase and Firestore
async function registerUser(email, password, name, address, role) {
    // Create user with email and password in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    // Update user profile displayName with the provided name
    await updateProfile(firebaseUser, { displayName: name });
    // Create a Firestore document for the user with additional info
    await setDoc(doc(db, "users", firebaseUser.uid), {
        name,
        email,
        address,
        role,
        createdAt: serverTimestamp(),
    });
    // Return the user object including their role
    return { ...firebaseUser, role };
}
// Main Register component for user registration form
export default function Register() {
    // Local states for managing form input values (name, email, password, address, role), handling errors, showing loading state during registration, and displaying success toast
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [address, setAddress] = useState("");
    const [role, setRole] = useState("user");
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    // Function to change pages programmatically
    const navigate = useNavigate();
    // Set up dispatch function to send actions to Redux store
    const dispatch = useDispatch();
    // Handle the registration process on form submission
    const handleRegister = async () => {
        setErrorMessage(null);
        // Validate that all required fields are filled
        if (!name || !email || !password || !address) {
            setErrorMessage("Please fill in all fields.");
            return;
        }
        // Password validation regex: 6-8 characters, letters and numbers only, no spaces not only numbers
        const passwordRegex = /^(?=.*[A-Za-z])([A-Za-z0-9]{6,8})$/;
        if (!passwordRegex.test(password)) {
            setErrorMessage("Password must be 6-8 characters, no spaces, only letters and numbers, and cannot be only numbers.");
            return;
        }
        try {
            setLoading(true);
            // Register user in Firebase Auth and Firestore
            const firebaseUser = await registerUser(email, password, name, address, role);
            // Update Redux store with user info
            dispatch(setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name,
                role,
            }));
            // Show success toast notification and after 2.5 seconds, navigate to home page
            setShowSuccessToast(true);
            setTimeout(() => navigate("/"), 2500);
        }
        catch (error) {
            const message = error instanceof Error
                ? `Registration failed: ${error.message}`
                : "An unknown error occurred.";
            setErrorMessage(message);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "d-flex justify-content-center align-items-center vh-100", children: _jsxs("div", { className: "container p-4 border rounded shadow-sm", style: { maxWidth: "500px" }, children: [_jsx("h2", { className: "text-center mb-4", children: "Create Account" }), errorMessage && (_jsx("div", { className: "alert alert-danger py-2", children: errorMessage })), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label", children: ["Name ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("input", { className: "form-control", placeholder: "Enter your name", value: name, onChange: (e) => setName(e.target.value), autoComplete: "name" })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label", children: ["Email ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("input", { className: "form-control", type: "email", placeholder: "Enter your email", value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "email" })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label", children: ["Password ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("input", { className: "form-control", type: "password", placeholder: "Create a password", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "new-password" })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label", children: ["Address ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("input", { className: "form-control", placeholder: "Enter your address", value: address, onChange: (e) => setAddress(e.target.value) })] }), _jsxs("div", { className: "mb-4", children: [_jsxs("label", { className: "form-label", children: ["Role ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsxs("select", { className: "form-select", value: role, onChange: (e) => setRole(e.target.value), children: [_jsx("option", { value: "user", children: "User" }), _jsx("option", { value: "admin", children: "Admin" })] }), _jsxs("p", { className: "text-muted small mt-1", children: [_jsx("span", { className: "text-danger", children: "*" }), "Role selection is for demo purposes only. In real apps, roles should be assigned securely by the backend.", _jsx("span", { className: "text-danger", children: "*" })] })] }), _jsx("div", { className: "d-flex justify-content-center", children: _jsxs("button", { className: "btn btn-primary", onClick: handleRegister, disabled: loading, children: [loading && (_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status", "aria-hidden": "true" })), loading ? "Registering..." : "Register"] }) })] }) }), _jsx("div", { className: `toast-container position-fixed bottom-0 end-0 p-3`, style: { zIndex: 1055 }, children: _jsx("div", { className: `toast align-items-center text-white bg-success border-0 ${showSuccessToast ? "show" : "hide"}`, role: "alert", children: _jsxs("div", { className: "d-flex", children: [_jsx("div", { className: "toast-body", children: "\uD83C\uDF89 Registration successful!" }), _jsx("button", { type: "button", className: "btn-close btn-close-white me-2 m-auto", onClick: () => setShowSuccessToast(false), "aria-label": "Close" })] }) }) })] }));
}
