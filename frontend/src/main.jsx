import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async"; // 1. Import the provider

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 2. Wrap your App component */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
