import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import { Otp } from "../models/otp.js";
import { sendEmail } from "../services/emailService.js";
import { generateForgetPasswordEmailTemplate } from "../utils/emailTemplate.js";
import { generateToken } from "../utils/generateToken.js";
import { generateOtp, generateOtpEmailTemplate } from "../utils/otpUtils.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

// ---------- Initiate Registration with OTP (Step 1) ----------
export const initiateRegistration = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }

  const normalizedEmail = email.trim().toLowerCase();
  
  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return next(new ErrorHandler("User already exists with this email", 400));
  }

  // Delete any existing OTP for this email
  await Otp.deleteMany({ email: normalizedEmail });

  // Generate new OTP
  const otp = generateOtp();

  // Save OTP record
  await Otp.create({
    email: normalizedEmail,
    otp,
    userData: { 
      name: name.trim(), 
      email: normalizedEmail, 
      password, 
      role: role || "Student" 
    },
  });

  // Send OTP email
  const emailHtml = generateOtpEmailTemplate(otp, name.trim());
  try {
    await sendEmail(normalizedEmail, "Verify Your Email - OTP Code", emailHtml);
  } catch (error) {
    await Otp.deleteMany({ email: normalizedEmail });
    return next(
      new ErrorHandler(
        process.env.NODE_ENV === "production"
          ? "Failed to send verification email"
          : `Failed to send verification email: ${error.message}`,
        500
      )
    );
  }

  res.status(200).json({
    success: true,
    message: `Verification code sent to ${normalizedEmail}`,
  });
});

// ---------- Verify OTP & Complete Registration (Step 2) ----------
export const verifyRegistrationOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorHandler("Email and OTP are required", 400));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const otpRecord = await Otp.findOne({ email: normalizedEmail });
  
  if (!otpRecord) {
    return next(new ErrorHandler("OTP expired or invalid. Please request a new one.", 400));
  }

  if (otpRecord.otp !== otp) {
    return next(new ErrorHandler("Invalid OTP code", 400));
  }

  // Check if OTP is expired (assuming 10 minutes validity)
  const otpCreatedAt = new Date(otpRecord.createdAt);
  const currentTime = new Date();
  const timeDifference = (currentTime - otpCreatedAt) / 1000 / 60; // in minutes
  
  if (timeDifference > 10) {
    await otpRecord.deleteOne();
    return next(new ErrorHandler("OTP has expired. Please request a new one.", 400));
  }

  // Create user from stored data
  const { name, password, role } = otpRecord.userData;
  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: role || "Student",
  });

  // Delete used OTP
  await otpRecord.deleteOne();

  // Generate token and send response
  generateToken(user, 201, "Registration successful", res);
});

// ---------- Resend OTP ----------
export const resendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Email is required", 400));
  }

  const normalizedEmail = email.trim().toLowerCase();
  
  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return next(new ErrorHandler("User already exists with this email", 400));
  }

  // Find existing OTP record
  const otpRecord = await Otp.findOne({ email: normalizedEmail });
  if (!otpRecord) {
    return next(new ErrorHandler("No registration found. Please start over.", 400));
  }

  // Generate new OTP
  const newOtp = generateOtp();
  
  // Update OTP record
  otpRecord.otp = newOtp;
  otpRecord.createdAt = new Date();
  await otpRecord.save();

  // Send new OTP email
  const emailHtml = generateOtpEmailTemplate(newOtp, otpRecord.userData.name);
  try {
    await sendEmail(normalizedEmail, "Verify Your Email - New OTP Code", emailHtml);
  } catch (error) {
    return next(
      new ErrorHandler(
        process.env.NODE_ENV === "production"
          ? "Failed to send verification email"
          : `Failed to send verification email: ${error.message}`,
        500
      )
    );
  }

  res.status(200).json({
    success: true,
    message: `New verification code sent to ${normalizedEmail}`,
  });
});

// ---------- Legacy direct registration (kept for backward compatibility) ----------
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }

  const normalizedEmail = email.trim().toLowerCase();
  
  let user = await User.findOne({ email: normalizedEmail });
  if (user) {
    return next(new ErrorHandler("User already exists", 400));
  }

  user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: role || "Student",
  });

  generateToken(user, 201, "User registered successfully", res);
});

// ---------- Login ----------
export const login = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }

  if (!role) {
    return next(new ErrorHandler("Please select your role", 400));
  }

  // Check if user is already logged in
  const { token } = req.cookies;
  if (token) {
    try {
      const decodedData = jwt.verify(token, process.env.JWT_SECRET);
      const existingUser = await User.findById(decodedData.id);
      if (existingUser && existingUser.email === email.trim().toLowerCase()) {
        return next(new ErrorHandler("User is already logged in", 400));
      }
    } catch (error) {
      // Token is invalid or expired, continue with login
      console.log("Invalid token, proceeding with login");
    }
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");
  
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Check if role matches
  if (user.role !== role) {
    return next(new ErrorHandler(`Invalid role. You are registered as ${user.role}`, 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  generateToken(user, 200, "Logged in successfully", res);
});

// ---------- Logout ----------
export const logout = asyncHandler(async (req, res, next) => {
  // Clear the cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(0) // Force expiration
  });
  
  // Optional: Add token to blacklist if you want to invalidate it immediately
  // This prevents using the same token again
  const token = req.cookies.token;
  if (token) {
    try {
      // You can store invalidated tokens in Redis or database
      // For now, we'll just clear the cookie
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
  
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});
// ---------- Get current user ----------
export const getUser = asyncHandler(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

// ---------- Update user profile ----------
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;
  const userId = req.user._id;

  const updateData = {};
  if (name) updateData.name = name.trim();
  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ 
      email: normalizedEmail, 
      _id: { $ne: userId } 
    });
    if (existingUser) {
      return next(new ErrorHandler("Email already in use", 400));
    }
    updateData.email = normalizedEmail;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

export const logoutSecure = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (token) {
      // Decode token to get user info (optional)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Optional: Store token in blacklist database
      // await TokenBlacklist.create({ 
      //   token, 
      //   userId: decoded.id,
      //   expiresAt: new Date(decoded.exp * 1000)
      // });
      
      // Optional: Update user's last logout time
      // await User.findByIdAndUpdate(decoded.id, { lastLogout: new Date() });
    }
    
    // Clear cookie with all options
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".yourdomain.com" : undefined
    });
    
    // Also clear any other session cookies
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    });
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error);
    // Even if there's an error, try to clear the cookie
    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  }
});

// ---------- Change password ----------
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler("Please provide all password fields", 400));
  }

  if (newPassword !== confirmNewPassword) {
    return next(new ErrorHandler("New passwords do not match", 400));
  }

  const user = await User.findById(req.user._id).select("+password");
  
  const isPasswordMatched = await user.comparePassword(currentPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Current password is incorrect", 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

// ---------- Forget Password ----------
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(new ErrorHandler("Please provide email address", 400));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  
  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = generateForgetPasswordEmailTemplate(resetUrl);

  try {
    await sendEmail(user.email, "Password Reset Request", message);
    res.status(200).json({
      success: true,
      message: `Password reset email sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message || "Failed to send email", 500));
  }
});

// ---------- Reset Password ----------
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!token) {
    return next(new ErrorHandler("Reset token is required", 400));
  }

  if (!password || !confirmPassword) {
    return next(new ErrorHandler("Please provide password and confirm password", 400));
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Password and confirm password do not match", 400));
  }

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Invalid or expired password reset token", 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  generateToken(user, 200, "Password reset successfully", res);
});

// ---------- Delete account ----------
export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(new ErrorHandler("Password is required to delete account", 400));
  }

  const user = await User.findById(req.user._id).select("+password");
  
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect password", 401));
  }

  await User.findByIdAndDelete(req.user._id);
  
  res.status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Account deleted successfully",
    });
});