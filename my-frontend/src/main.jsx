import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AuthGate from "./AuthGate";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AuthGate>
      <App />
    </AuthGate>
  </React.StrictMode>
);
