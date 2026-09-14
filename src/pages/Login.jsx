import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    flow: "auth-code",

    // Always show Google account selection
    prompt: "select_account",

    // Permissions required by SpaceWise
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/drive",
    ].join(" "),

    onSuccess: async (codeResponse) => {
      try {
        console.log("Google authorization successful");

        const response = await axios.post(
          "/api/auth/google",
          {
            code: codeResponse.code,
          }
        );

        if (response.data.success) {
          // Save SpaceWise JWT
          localStorage.setItem(
            "token",
            response.data.token
          );

          // Save logged-in Google user
          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );

          // Go to Dashboard
          navigate("/");
        }
      } catch (error) {
        console.error(
          "Google Login Error:",
          error.response?.data || error.message
        );
      }
    },

    onError: (error) => {
      console.error(
        "Google Login Failed:",
        error
      );
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0d]">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111113] p-8 text-center shadow-2xl">

        <h1 className="text-2xl font-semibold text-white">
          Welcome to SpaceWise
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Manage your Google Drive and Gmail intelligently.
        </p>

        <button
          type="button"
          onClick={() => login()}
          className="mt-8 w-full rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200"
        >
          Continue with Google
        </button>

      </div>
    </div>
  );
}

export default Login;