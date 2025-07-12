import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react"; // Import React hooks for state and side effects
import { useNavigate } from "react-router-dom"; // Import navigation hook to change pages programmatically
import { getAuth, sendPasswordResetEmail } from "firebase/auth"; // Import Firebase Authentication functions for password reset
// Component for "Forgot Password" email form
export default function ForgotPasswordEmail() {
    // Local states for managing email input, success/error messages, loading state, and redirect countdown
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(false);
    // Get Firebase Auth instance
    const auth = getAuth();
    // Function to redirect user to another page
    const navigate = useNavigate();
    // Handler for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Clear previous messages
        setMessage("");
        setError("");
        // Check if email is empty or only spaces
        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }
        // Start loading state to disable inputs
        setLoading(true);
        try {
            // Send password reset email using Firebase
            await sendPasswordResetEmail(auth, email.trim());
            // Show success message if email sent
            setMessage("Password reset email sent! Check your inbox.");
            // Start countdown to redirect user
            setRedirectCountdown(true);
        }
        catch (err) {
            // Handle errors from Firebase
            if (err instanceof Error) {
                setError(err.message);
            }
            else {
                setError("An unexpected error occurred.");
            }
        }
        finally {
            // Stop loading state (enable inputs again)
            setLoading(false);
        }
    };
    // Effect to redirect user after 5 seconds if redirectCountdown is true
    useEffect(() => {
        if (redirectCountdown) {
            const timer = setTimeout(() => {
                navigate("/login");
            }, 5000);
            // Cleanup: clear timer if component unmounts or redirectCountdown changes
            return () => clearTimeout(timer);
        }
    }, [redirectCountdown, navigate]); // Run only when redirectCountdown or navigate changes
    return (_jsx("div", { className: "d-flex justify-content-center align-items-center", style: { minHeight: "80vh" }, children: _jsxs("form", { onSubmit: handleSubmit, style: { maxWidth: "400px", width: "100%", backgroundColor: "#A3C1AD" }, className: "p-4 border rounded shadow-sm", children: [_jsx("h2", { className: "mb-4 text-center", children: "Forgot Password" }), error && _jsx("div", { className: "alert alert-danger", children: error }), message && (_jsxs("div", { className: "alert alert-success", children: [message, " Redirecting to login in 5 seconds..."] })), _jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: "emailInput", className: "form-label", children: "Email address" }), _jsx("input", { id: "emailInput", type: "email", className: "form-control", placeholder: "Enter your email", value: email, onChange: (e) => setEmail(e.target.value), disabled: loading, required: true, autoComplete: "email" })] }), _jsx("div", { className: "d-flex justify-content-center", children: _jsx("button", { type: "submit", className: "btn btn-primary", disabled: loading, children: loading ? "Sending..." : "Send Reset Email" }) })] }) }));
}
