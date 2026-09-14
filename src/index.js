import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <GoogleOAuthProvider clientId="1039710511267-u3ukd1k7dgqor4m10vlbguecd0q1tmol.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);