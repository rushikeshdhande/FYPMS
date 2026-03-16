import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { KeyRound, Loader } from "lucide-react"; 
import { forgotPassword } from "../../store/slices/authSlice";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { isRequestingForToken } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

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
      await dispatch(forgotPassword({ email })).unwrap();
      setIsSubmitted(true);
    } catch (error) {
      setError(error || "Failed to send reset link. Please try again");
    }
  };

// Success state UI
if (isSubmitted) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full text-center">

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 flex items-center justify-center rounded-full bg-green-500">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold text-gray-800">
          Check Your Email
        </h2>

        <p className="mt-2 text-gray-500 text-sm">
          We've sent a password reset link to your email address.
        </p>

        {/* Card */}
        <div className="mt-6 bg-white border rounded-lg p-6 shadow-sm">
          <p className="text-gray-600 text-sm">
            If an account with{" "}
            <span className="font-medium text-gray-900">{email}</span> exists,
            you will receive a password reset email shortly.
          </p>

          {/* Buttons */}
          <div className="mt-6 space-y-3">
            <Link
              to="/login"
              className="block w-full py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              Back to Login
            </Link>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setError("");
              }}
              className="block w-full py-2 rounded-md border border-blue-600 text-blue-600 font-medium hover:bg-blue-50"
            >
              Send Another Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
  // Main form UI (unchanged)
  return (
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
          <p className="text-slate-600 mt-2">Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        {/* Forgot password form */}
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
            <p className="text-sm text-slate-600">
              Remember Your Password?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;