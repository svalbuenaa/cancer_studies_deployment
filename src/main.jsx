// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import "./App.css";

// --- GitHub Pages SPA redirect restore ---
const redirect = sessionStorage.redirect;
if (redirect) {
  delete sessionStorage.redirect;
  // Restore the original URL before React Router renders
  window.history.replaceState(null, "", redirect);
}
// -----------------------------------------

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/cancer_studies_deployment/">
      <App />
    </BrowserRouter>
  </StrictMode>
);
