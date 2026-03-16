import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";

import { sendEmail } from "../services/emailService.js";
import { generateForgetPasswordEmailTemplate } from "../utils/emailTemplate.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";



// Register user
export const registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return next(new ErrorHandler("Please enter all fields", 400));
    }

    let user = await User.findOne({ email });

    if (user) {
        return next(new ErrorHandler("User already exists", 400));
    }

    user = new User({
        name,
        email,
        password,
        role,
    });

    await user.save();

    generateToken(user, 201, "User registered successfully", res);
});


export const login = asyncHandler(async (req, res, next) => {

    // check user already logged in
   /*  if (req.cookies.token) {
        return next(new ErrorHandler("User already logged in", 400));
    }
 */
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    const user = await User.findOne({ email, role }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email, password or role", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email, password or role", 401));
    }

    generateToken(user, 200, "Logged in successfully", res);
});



// Logout
export const logout = asyncHandler(async (req, res, next) => {

    res.status(200)
        .cookie("token", "", {
            expires: new Date(Date.now()),
            httpOnly: true,
        })
        .json({
            success: true,
            message: "Logged out successfully",
        });

});



// Get current user
export const getUser = asyncHandler(async (req, res, next) => {

    const user = req.user;

    res.status(200).json({
        success: true,
        user,
    });

});


// Forget Password
export const forgetPassword = asyncHandler(async (req, res, next) => {
  // Check if email exists in request body
  if (!req.body.email) {
    return next(new ErrorHandler("Please provide email address", 400));
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const message = generateForgetPasswordEmailTemplate(resetUrl);

  try {
    await sendEmail(user.email, "Password Reset Request", message);

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message || "Cannot send email", 500));
  }
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params; // Get token from params, not query

  if (!token) {
    return next(new ErrorHandler("Reset token is required", 400));
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

  if (!req.body.password || !req.body.confirmPassword) {
    return next(new ErrorHandler("Please provide all required fields.", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password and confirm password do not match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  generateToken(user, 200, "Password reset successfully", res);
});