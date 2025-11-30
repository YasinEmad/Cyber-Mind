import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import { setUser } from "../redux/slices/userSlice";
import axios from "@/api/axios";

const LoginPage: React.FC = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // NOTE: Email/password login and password-reset are intentionally removed.
  // We allow Google and GitHub sign-in (via Firebase) — backend auto-creates/updates the user on first login.

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);

      const idToken = await result.user.getIdToken();

      // Align with backend route -> POST /api/users/auth/google
      const { data } = await axios.post("/users/auth/google", {
        token: idToken,
      });

      dispatch(setUser(data.data));
      navigate("/profile");
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled.");
      } else {
        setError(err.message || "An error occurred during Google Sign-In.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    const provider = new GithubAuthProvider();
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // send to backend for verification & sync (same Firebase ID token flow)
      // NOTE: The original code was pointing GitHub sign-in to a Google endpoint: "/users/auth/google".
      // Assuming this is the correct endpoint for handling *any* Firebase OAuth token on the backend, I'll keep it.
      // If your backend has a dedicated GitHub endpoint, you should change it to something like: "/users/auth/github"
      const { data } = await axios.post("/users/auth/google", {
        token: idToken,
      });

      dispatch(setUser(data.data));
      navigate("/profile");
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled.");
      } else {
        setError(err.message || "An error occurred during GitHub Sign-In.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      {/* Main Two-Column Container for Desktop */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl lg:max-w-4xl xl:max-w-6xl lg:flex lg:flex-row lg:justify-center lg:gap-12 lg:items-center">
        {/* 1. Left Column: Login Card */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md lg:mt-0 lg:mx-0 lg:w-1/2">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100 lg:text-left">
              Login to track your progress
            </h2>
          </div>

          <div className="mt-4 bg-white dark:bg-gray-800 py-8 px-4 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg sm:px-10">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm text-center">
                {error}
              </div>
            )}

            {/* Google sign-in only — email/password & reset removed to avoid account duplication */}

            {/* Google sign-in above the separator */}
            <div className="mt-6">
              <div className="space-y-3">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                    loading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M12.0002 4.75C14.0416 4.75 15.655 5.48514 16.9178 6.64322L19.2642 4.29688C17.4332 2.61334 15.0294 1.75 12.0002 1.75C7.99591 1.75 4.5492 3.66986 2.50293 6.64322L4.92131 8.57211C5.70014 6.36884 8.64735 4.75 12.0002 4.75Z"
                      fill="#EA4335"
                    />
                    <path
                      d="M12.0002 22.25C15.0294 22.25 17.4332 21.3867 19.2642 19.7031L16.9178 17.3568C15.655 18.5149 14.0416 19.25 12.0002 19.25C8.64735 19.25 5.70014 17.6312 4.92131 15.4279L2.50293 17.3568C4.5492 20.3301 7.99591 22.25 12.0002 22.25Z"
                      fill="#34A853"
                    />
                    <path
                      d="M19.7431 12.375C19.7431 11.5471 19.6703 10.9234 19.5395 10.2785H12.0002V14.0625H16.4842C16.2755 15.0601 15.6948 15.8617 14.9317 16.375L17.3501 18.3039C18.6631 17.1561 19.7431 15.5562 19.7431 12.375Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M4.92131 15.4279C4.69531 14.7336 4.57752 14.0049 4.57752 12.375C4.57752 10.7451 4.69531 10.0164 4.92131 9.32207L2.50293 7.39318C2.10099 8.52684 1.875 9.87383 1.875 12.375C1.875 14.8762 2.10099 16.2232 2.50293 17.3568L4.92131 15.4279Z"
                      fill="#FBBC05"
                    />
                  </svg>
                  {loading ? "Processing..." : "Sign in with Google"}
                </button>
              </div>

            {/* Separator */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>
            </div>

            {/* GitHub sign-in below the separator */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleGithubSignIn}
                disabled={loading}
                className={`w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                  loading
                    ? " text-gray-400 cursor-not-allowed"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                }`}
              >
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 0C5.372 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.6.113.793-.26.793-.577 0-.285-.01-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.809 1.305 3.492.998.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.332-5.467-5.93 0-1.31.469-2.38 1.236-3.22-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.403c1.018.004 2.044.138 3.003.403 2.291-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.873.119 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.624-5.48 5.92.43.372.814 1.102.814 2.222 0 1.606-.015 2.901-.015 3.293 0 .319.192.694.8.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  {loading ? "Processing..." : "Sign in with GitHub"}
                </button>
              </div>
            </div>

            {/* No registration — sign in with Google only */}
          </div>
        </div>

        {/* 2. Right Column: Image and Promotional Text */}
        <div className="hidden lg:block lg:w-1/2 lg:pl-12">
          <div className="text-center lg:text-left">
            <p className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Unlock Your Potential.
            </p>

            <div className="rounded-lg shadow-2xl overflow-hidden">
              {/* NOTE: If running this in a different environment, you might need to adjust the image path */}
              <img
                className="w-full h-auto"
                src="/assets/login-image.jpeg"
                alt="Login Illustration"
              />
            </div>
          </div>
        </div>
      </div>
    </div> 
  );
  
};

export default LoginPage;