import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { KeyRound, Loader } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { isRequestingForToken } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth || {});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error
    setError("");

    // Validate email
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await dispatch(ForgotPassword({ email })).unwrap();
      setIsSubmitted(true);
    } catch (error) {
      setError(error?.message || error || "Failed to send reset link. Please try again");
    }
  };

  // Success state UI
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Success icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success message */}
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            <p className="mt-4 text-sm text-gray-600">
              We've sent a password reset link to:
            </p>
            <p className="mt-2 text-md font-medium text-indigo-600">{email}</p>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </p>
              </div>
            </div>
          </div>

          {/* Additional tips */}
          <div className="mt-6 text-left bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800">Didn't receive the email?</h3>
            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>The email may take a few minutes to arrive</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="mt-8 space-y-4">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setError("");
              }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try another email
            </button>

            <div className="text-sm">
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Return to sign in
              </Link>
            </div>
          </div>

          {/* Support link */}
          <p className="mt-8 text-xs text-gray-400">
            If you're still having trouble,{" "}
            <Link to="/contact" className="text-indigo-600 hover:text-indigo-500">
              contact support
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Main form UI
  return (
    <>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Forgot Password?
            </h2>
            <p className="text-slate-600 mt-2"> Enter your email address and we'll send you a link to reset your
              password.</p>
          </div>

          {/* Login form */}
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}



              {/* Email Address */}
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className={`input ${error ? "input-error" : ""}`}
                  placeholder="Enter your email"
                  disabled={isRequestingForToken}
                />
                {error && (
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                )}
              </div>



              {/* Submit button */}
              <button
                type="submit"
                disabled={isRequestingForToken}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequestingForToken ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600" >
                Remember Your Password? <Link to={"/login"} className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;