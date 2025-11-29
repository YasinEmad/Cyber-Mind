import React, { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../firebase";
import { setUser } from "../redux/slices/userSlice";
import axios from "@/api/axios";

// Helper function to map Firebase error codes to user-friendly messages
const getAuthErrorMessage = (error: any): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email address is already registered. Try logging in.";
      case "auth/invalid-email":
        return "The email address is not valid.";
      case "auth/weak-password":
        return "The password is too weak. It must be at least 6 characters.";
      case "auth/popup-closed-by-user":
        // This is generally a non-critical error, often just ignored
        return ""; 
      default:
        return error.message || "An unexpected Firebase error occurred.";
    }
  }
  if (axios.isAxiosError(error) && error.response) {
      // Handle backend-specific error messages if available
      return error.response.data.message || "A backend error occurred during user creation.";
  }
  return "An unknown error occurred during registration.";
};

const RegisterPage: React.FC = () => {
  // --- State for Inputs and UX ---
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State for immediate input validation feedback (UX improvement)
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- Input Validation Logic ---
  const validateInputs = useCallback((): boolean => {
    let isValid = true;

    // Simple username validation (e.g., must be 3+ chars)
    const uValid = username.trim().length >= 3;
    setIsUsernameValid(uValid);
    if (!uValid) isValid = false;

    // Simple email validation (basic regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const eValid = emailRegex.test(email);
    setIsEmailValid(eValid);
    if (!eValid) isValid = false;

    // Password strength check (Firebase requires min 6 chars)
    const pValid = password.length >= 6;
    setIsPasswordValid(pValid);
    if (!pValid) isValid = false;

    return isValid;
  }, [username, email, password]);
  
  // --- Handlers ---

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Initial Validation
    if (!validateInputs()) {
      setError("Please check your input fields for errors.");
      return;
    }

    setLoading(true);

    try {
      // 2. Firebase Registration
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();

      // 3. Backend User Creation/Sync
      const { data } = await axios.post("/users/register", {
        token: idToken,
        username,
      });

      // 4. Success: Update Redux and Navigate
      dispatch(setUser(data.data));
      navigate("/profile");

    } catch (err) {
      // 5. Error Handling
      const userMessage = getAuthErrorMessage(err);
      if (userMessage) {
        setError(userMessage);
      } else {
        // Only set error if it's not the benign 'popup closed' error
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError("");

    try {
      // 1. Open Popup and Sign In
      const result = await signInWithPopup(auth, provider);
      
      // 2. Get Token immediately after success
      const idToken = await result.user.getIdToken();

      // 3. Send to backend for verification/sync
      const { data } = await axios.post("/users/auth/firebase", {
        token: idToken,
      });

      // 4. Success: Update Redux and Navigate
      dispatch(setUser(data.data));
      navigate("/profile");

    } catch (err) {
      // 5. Error Handling
      const userMessage = getAuthErrorMessage(err);
      if (userMessage) {
        setError(userMessage);
      }
      // Note: No 'else' block needed, because getAuthErrorMessage handles a fallback.
    } finally {
      setLoading(false);
    }
  };

  // --- Rendering ---
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl lg:max-w-4xl xl:max-w-6xl lg:flex lg:flex-row lg:justify-center lg:gap-12 lg:items-center">
        {/* 1. Left Column: Registration Card */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md lg:mt-0 lg:mx-0 lg:w-1/2">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100 lg:text-left">
              Create Your Account 🚀
            </h2>
          </div>

          <div className="mt-4 bg-transparent py-8 px-4 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg sm:px-10">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm text-center">
                **Error:** {error}
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
                  Username (Min 3 characters)
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setIsUsernameValid(e.target.value.trim().length >= 3);
                    }}
                    placeholder="your_username"
                    className={`appearance-none block w-full px-3 py-2 border ${
                      isUsernameValid 
                        ? 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500' 
                        : 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    } dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                  />
                  {!isUsernameValid && (
                    <p className="mt-2 text-sm text-red-600">
                      Username must be at least 3 characters.
                    </p>
                  )}
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Simple inline email check
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      setIsEmailValid(emailRegex.test(e.target.value));
                    }}
                    placeholder="name@example.com"
                    className={`appearance-none block w-full px-3 py-2 border ${
                      isEmailValid 
                        ? 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500' 
                        : 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    } dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                  />
                  {!isEmailValid && (
                    <p className="mt-2 text-sm text-red-600">
                      Please enter a valid email address.
                    </p>
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password (Min 6 characters)
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setIsPasswordValid(e.target.value.length >= 6);
                    }}
                    placeholder="••••••••"
                    className={`appearance-none block w-full px-3 py-2 border ${
                      isPasswordValid 
                        ? 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500' 
                        : 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    } dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                  />
                  {!isPasswordValid && (
                    <p className="mt-2 text-sm text-red-600">
                      Password must be at least 6 characters long.
                    </p>
                  )}
                </div>
              </div>

              {/* Register Button */}
              <div>
                <button
                  type="submit"
                  // Disable if loading or if any input is invalid
                  disabled={loading || !isUsernameValid || !isEmailValid || !isPasswordValid}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-150 ease-in-out ${
                    loading || !isUsernameValid || !isEmailValid || !isPasswordValid
                      ? "bg-indigo-400 opacity-70 cursor-not-allowed"
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
                  className={`w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium transition duration-150 ease-in-out ${
                    loading
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-transparent dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }`}
                >
                  {/* ... SVG Icon (kept the original, no change needed) ... */}
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
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* 2. Right Column: Image and Promotional Text (Unchanged) */}
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