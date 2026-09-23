import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const codeClientRef = useRef(null);
  const initializedRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Prevent Google client from being initialized twice
    if (initializedRef.current) {
      return;
    }

    const initializeGoogle = () => {
      if (!window.google) {
        return;
      }

      if (initializedRef.current) {
        return;
      }

      initializedRef.current = true;

      codeClientRef.current =
        window.google.accounts.oauth2.initCodeClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,

          scope: [
            "openid",
            "email",
            "profile",

            // Gmail
            "https://mail.google.com/",

            // Google Drive
            "https://www.googleapis.com/auth/drive",
          ].join(" "),

          prompt: "consent",

          ux_mode: "popup",

          callback: async (response) => {
            // ==========================================
            // CHECK GOOGLE AUTHORIZATION RESPONSE
            // ==========================================

            if (!response || !response.code) {
              console.error(
                "Google authorization failed:",
                response
              );

              setError(
                "Google authorization failed. Please try again."
              );

              return;
            }

            try {
              setLoading(true);
              setError("");

              console.log(
                "Google authorization code received"
              );

              // ==========================================
              // SEND AUTHORIZATION CODE TO BACKEND
              // ==========================================

              const result = await axios.post(
                "/api/auth/google-login",
                {
                  // IMPORTANT:
                  // Use response.code, NOT code
                  code: response.code,
                }
              );

              console.log(
                "SpaceWise login successful"
              );

              // ==========================================
              // SAVE JWT TOKEN
              // ==========================================

              if (result.data.token) {
                localStorage.setItem(
                  "token",
                  result.data.token
                );
              }

              // ==========================================
              // SAVE USER INFORMATION
              // ==========================================

              if (result.data.user) {
                localStorage.setItem(
                  "user",
                  JSON.stringify(result.data.user)
                );
              }

              // ==========================================
              // GO TO DASHBOARD
              // ==========================================

              navigate("/", {
                replace: true,
              });

            } catch (err) {
              console.error(
                "Google Login Error:",
                err
              );

              console.error(
                "Google Login Server Response:",
                err.response?.data
              );

              setError(
                err.response?.data?.message ||
                  "Google login failed. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        });
    };

    // ==========================================
    // GOOGLE SCRIPT ALREADY LOADED
    // ==========================================

    if (window.google) {
      initializeGoogle();
      return;
    }

    // ==========================================
    // CHECK IF GOOGLE SCRIPT IS ALREADY LOADING
    // ==========================================

    const existingScript =
      document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        initializeGoogle
      );

      return () => {
        existingScript.removeEventListener(
          "load",
          initializeGoogle
        );
      };
    }

    // ==========================================
    // LOAD GOOGLE IDENTITY SERVICES
    // ==========================================

    const script =
      document.createElement("script");

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload = initializeGoogle;

    script.onerror = () => {
      console.error(
        "Failed to load Google Identity Services"
      );

      setError(
        "Unable to load Google login. Please check your internet connection."
      );
    };

    document.head.appendChild(script);

    return () => {
      // Do not remove Google script.
      // It can be reused if Login remounts.
    };
  }, [navigate]);

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  const handleGoogleLogin = () => {
    if (loading) {
      return;
    }

    if (!codeClientRef.current) {
      setError(
        "Google login is still loading. Please try again."
      );

      return;
    }

    // ==========================================
    // CLEAR OLD SPACEWISE SESSION
    // ==========================================

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // ==========================================
    // CLEAR OLD SESSION DATA
    // ==========================================

    sessionStorage.clear();

    setError("");

    // ==========================================
    // REQUEST GOOGLE AUTHORIZATION CODE
    // ==========================================

    try {
      codeClientRef.current.requestCode();
    } catch (err) {
      console.error(
        "Google requestCode Error:",
        err
      );

      setError(
        "Unable to start Google login. Please try again."
      );
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0d",
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "380px",
          maxWidth: "90%",
          padding: "40px",
          border: "1px solid #303034",
          borderRadius: "18px",
          background: "#111114",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            marginBottom: "8px",
          }}
        >
          SpaceWise
        </h1>

        <p
          style={{
            color: "#888891",
            marginBottom: "32px",
          }}
        >
          Storage intelligence
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #444",
            background: "#ffffff",
            color: "#111",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading
              ? "not-allowed"
              : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? "Signing in..."
            : "Continue with Google"}
        </button>

        {error && (
          <p
            style={{
              color: "#ff6464",
              marginTop: "20px",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

export default Login;