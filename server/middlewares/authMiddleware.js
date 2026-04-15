// middlewares/authMiddleware.js
import { asyncHandler } from "./asyncHandler.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

// Check if user is authenticated
export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedData.id);
    
    if (!user) {
      return next(new ErrorHandler("User not found", 401));
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token. Please login again.", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token expired. Please login again.", 401));
    }
    return next(new ErrorHandler("Authentication failed", 401));
  }
});

// Alias for isAuthenticated (for backward compatibility)
export const isAuthenticatedUser = isAuthenticated;

// Check if user has specific role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role (${req.user.role}) is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

// Alias for authorizeRoles (for backward compatibility)
export const isAuthorized = authorizeRoles;

// Check if user is admin
export const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "Admin") {
    return next(new ErrorHandler("Access denied. Admin only.", 403));
  }
  next();
});

// Check if user is teacher/faculty
export const isTeacher = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "Teacher" && req.user.role !== "Admin") {
    return next(new ErrorHandler("Access denied. Teacher only.", 403));
  }
  next();
});

// Check if user is student
export const isStudent = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "Student" && req.user.role !== "Admin") {
    return next(new ErrorHandler("Access denied. Student only.", 403));
  }
  next();
});