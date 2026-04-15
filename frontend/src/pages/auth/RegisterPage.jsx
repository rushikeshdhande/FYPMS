import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  clearRegistrationEmail,
} from "../../store/slices/authSlice";
import { BookOpen, Loader, Eye, EyeOff, ArrowLeft } from "lucide-react";

const RegisterPage = () => {
  const dispatch = useDispatch();
  const {
    isSendingOtp,
    isVerifyingOtp,
    authUser,
    registrationEmail,
  } = useSelector((state) => state.auth);

  const [step, setStep] = useState("details"); // "details" or "otp"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // When OTP is sent successfully, move to OTP step
  useEffect(() => {
    if (registrationEmail) {
      setStep("otp");
    }
  }, [registrationEmail]);

  // After successful registration, redirect
  useEffect(() => {
    if (authUser) {
      const userRole =
        authUser.role ||
        authUser.user?.role ||
        authUser.userType ||
        authUser.type ||
        authUser.accountType;
      const roleLowerCase = userRole?.toLowerCase();
      if (roleLowerCase === "admin") navigate("/admin");
      else if (roleLowerCase === "teacher") navigate("/teacher");
      else if (roleLowerCase === "student") navigate("/student");
      else navigate("/dashboard");
    }
  }, [authUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    if (errors.otp) setErrors((prev) => ({ ...prev, otp: "" }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validateDetails = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!validateDetails()) return;
    dispatch(sendRegistrationOtp(formData));
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setErrors({ otp: "Please enter a valid OTP" });
      return;
    }
    dispatch(verifyRegistrationOtp({ email: registrationEmail, otp }));
  };

  const goBackToDetails = () => {
    dispatch(clearRegistrationEmail());
    setStep("details");
    setOtp("");
    setErrors({});
  };

  // --- Step 1: Registration Details ---
  if (step === "details") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Create an Account</h2>
            <p className="text-slate-600 mt-2">Step 1: Enter your details</p>
          </div>

          <div className="card">
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input ${errors.name ? "input-error" : ""}`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input ${errors.email ? "input-error" : ""}`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input ${errors.password ? "input-error" : ""} pr-10`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="label">Select Role</label>
                <select
                  name="role"
                  className="input"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingOtp ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Sending OTP...
                  </div>
                ) : (
                  "Send Verification Code"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Step 2: OTP Verification ---
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Verify Your Email</h2>
          <p className="text-slate-600 mt-2">
            We sent a verification code to{" "}
            <span className="font-medium text-slate-800">{registrationEmail}</span>
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="label">Enter OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                className={`input text-center text-2xl tracking-widest ${errors.otp ? "input-error" : ""}`}
                placeholder="••••••"
                maxLength={6}
                autoFocus
              />
              {errors.otp && <p className="text-sm text-red-600 mt-1">{errors.otp}</p>}
            </div>

            <button
              type="submit"
              disabled={isVerifyingOtp}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifyingOtp ? (
                <div className="flex items-center justify-center">
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Verifying...
                </div>
              ) : (
                "Verify & Create Account"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={goBackToDetails}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to edit details
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={() => dispatch(sendRegistrationOtp(formData))}
                className="text-blue-600 hover:text-blue-500 font-medium"
                disabled={isSendingOtp}
              >
                Resend OTP
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;