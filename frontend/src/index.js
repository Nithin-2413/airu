import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suppress ResizeObserver errors (benign React warnings that don't affect functionality)
// These errors occur when components resize rapidly during animations
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('ResizeObserver loop')) {
    e.stopImmediatePropagation();
    e.preventDefault();
    return true;
  }
});

const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('ResizeObserver loop') || 
     args[0].includes('ResizeObserver'))
  ) {
    return;
  }
  originalError.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
