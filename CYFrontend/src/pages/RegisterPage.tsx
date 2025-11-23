import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup, // Changed from signInWithRedirect
} from "firebase/auth";
import { auth } from "../firebase";
import { setUser } from "../redux/slices/userSlice";
import axios from "axios";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // REMOVED: useEffect for getRedirectResult is no longer needed for Popup flow

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();

      const { data } = await axios.post("/api/users/register", {
        token: idToken,
        username,
      });
      dispatch(setUser(data.data));
      navigate("/profile");
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError("");
    
    try {
      // 1. Open Popup
      const result = await signInWithPopup(auth, provider);
      
      // 2. Get Token immediately after popup closes successfully
      const idToken = await result.user.getIdToken();

      // 3. Send to backend
      const { data } = await axios.post("/api/users/auth/firebase", {
        token: idToken,
      });

      // 4. Update Redux and Navigate
      dispatch(setUser(data.data));
      navigate("/profile");

    } catch (err: any) {
      // Handle "Popup closed by user" specifically if you want to ignore it, 
      // otherwise show error.
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "An error occurred during Google Sign-In.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Main Two-Column Container for Desktop */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl lg:max-w-4xl xl:max-w-6xl lg:flex lg:flex-row lg:justify-center lg:gap-12 lg:items-center">
        {/* 1. Left Column: Registration Card */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md lg:mt-0 lg:mx-0 lg:w-1/2">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100 lg:text-left">
              Create Your Account
            </h2>
          </div>

          {/* Card Container */}
          <div className="mt-4 bg-transparent py-8 px-4 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg sm:px-10">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm text-center">
                {error}
              </div>
            )}

            {/* Registration Form */}
            <form className="space-y-6" onSubmit={handleEmailRegister}>
              {/* Username Input */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Register Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }`}
                >
                  {loading ? "Creating Account..." : "Register"}
                </button>
              </div>
            </form>

            {/* Separator and Google Register */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Button */}
              <div className="mt-6">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                    loading
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-transparent dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                  {loading ? "Processing..." : "Sign up with Google"}
                </button>
              </div>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                you have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  login here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* 2. Right Column: Image and Promotional Text */}
        <div className="hidden lg:block lg:w-1/2 lg:pl-12">
          <div className="text-center lg:text-left">
            <p className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Join Our Community Today.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Get started in seconds. Create your free account and unlock
              premium features.
            </p>

            <div className="rounded-lg shadow-2xl overflow-hidden">
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

export default RegisterPage;