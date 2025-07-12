import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { memo } from "react"; // Import the `memo` function from React to optimize performance (prevents unnecessary re-renders)
import "./components.css"; // Import the CSS file for styling this component
// Define the Footer component
const Footer = () => {
    // Get the current year from the system's date
    const year = new Date().getFullYear();
    return (_jsx("footer", { className: "footer", role: "contentinfo", children: _jsxs("small", { children: ["\u00A9 ", year, " M.C Boutique. All rights reserved."] }) }));
};
// Export the Footer component wrapped in React.memo to avoid re-rendering if props don’t change
export default memo(Footer);
