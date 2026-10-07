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
  "https://mail.google.com/",
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
    <main className="relative min-h-screen overflow-hidden bg-[#08090d] text-white">
      {/* Background effects */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:px-12">

        {/* LEFT SIDE */}
        <section className="hidden lg:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-2xl font-bold shadow-lg shadow-violet-500/20">
              S
            </div>
            <span className="text-2xl font-semibold tracking-tight">
              SpaceWise
            </span>
          </div>

          <p className="mb-5 inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm text-violet-300">
            ✦ Smart Storage Management
          </p>

          <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight xl:text-6xl">
            Your digital space,
            <span className="block bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              intelligently managed.
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-8 text-gray-400">
            Take control of your Google Drive and Gmail.
            Discover duplicates, organize files, and manage
            your digital storage from one place.
          </p>

          {/* Storage illustration */}
          <div className="relative mt-14 flex h-64 max-w-lg items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#171326] via-[#111827] to-[#10131d]">
            <div className="absolute h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative grid grid-cols-2 gap-4">
              <div className="flex h-24 w-28 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-xl backdrop-blur-xl">
                <span className="text-3xl">📁</span>
                <span className="mt-2 text-xs text-gray-300">Drive</span>
              </div>

              <div className="flex h-24 w-28 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-xl backdrop-blur-xl">
                <span className="text-3xl">✉️</span>
                <span className="mt-2 text-xs text-gray-300">Gmail</span>
              </div>

              <div className="col-span-2 mx-auto flex h-16 w-44 items-center justify-center gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/10">
                <span className="text-2xl">✦</span>
                <span className="text-sm font-medium text-violet-200">
                  SpaceWise Intelligence
                </span>
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            One place. Better organization. Smarter storage.
          </p>
        </section>

        {/* RIGHT SIDE - LOGIN CARD */}
        <section className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-[#11131a]/90 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">

            {/* Mobile branding */}
            <div className="mb-10 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-2xl font-bold">
                S
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">
                SpaceWise
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Storage intelligence
              </p>
            </div>

            <div className="mb-9">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-violet-400">
                Welcome
              </p>

              <h2 className="text-3xl font-semibold tracking-tight">
                Sign in to SpaceWise
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                Connect your Google account to manage your
                digital storage intelligently.
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 font-semibold text-gray-900 transition hover:bg-gray-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-gray-900" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 48 48"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.73 6C44.43 37.91 46.98 31.72 46.98 24.55Z" />
                    <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.28-3.13.78-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.97-6.19Z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300">
                {error}
              </div>
            )}

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-gray-500">
                SECURE AUTHENTICATION
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <p className="text-center text-xs leading-6 text-gray-500">
              By continuing, you authorize SpaceWise to access
              the Google services requested during sign-in.
            </p>
          </div>

          <p className="mt-7 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} SpaceWise. All rights reserved.
          </p>
        </section>
      </div>
    </main>
  );
}

export default Login;
