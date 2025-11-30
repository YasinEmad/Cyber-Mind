import React from "react";
import { Link } from "react-router-dom";


const RegisterPage: React.FC = () => {

  // Nothing to do here — registration disabled. File kept as a friendly redirect page.

  // Simple informative page — registration removed
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Registration Disabled</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">We no longer support manual registration. Please sign in with Google from the login page — your account will be automatically created or updated on first login.</p>
        <Link to="/login" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Go to Login</Link>
      </div>
    </div>
  );
};

export default RegisterPage;