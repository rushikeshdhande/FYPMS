// middlewares/authMiddleware.js
import { asyncHandler } from "./asyncHandler.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

// Blacklist for invalidated tokens (optional - for production)
// You can use Redis or a database table for better performance
const tokenBlacklist = new Set();

// Check if user is authenticated
export const isAuthenticated = asyncHandler(async (req, res, next) => {
  let token = req.cookies.token;
  
  // Also check Authorization header if needed
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  try {
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return next(new ErrorHandler("Token is invalid. Please login again.", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedData.id).select("-password");
    
    if (!user) {
      return next(new ErrorHandler("User not found", 401));
    }
    
    // Attach user and token to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token. Please login again.", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Session expired. Please login again.", 401));
    }
    return next(new ErrorHandler("Authentication failed", 401));
  }
});

// Alias for isAuthenticated (for backward compatibility)
export const isAuthenticatedUser = isAuthenticated;

// Check if user has specific role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("User not authenticated", 401));
    }
    
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
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }
  
  if (req.user.role !== "Admin") {
    return next(new ErrorHandler("Access denied. Admin only.", 403));
  }
  next();
});

// Check if user is teacher/faculty
export const isTeacher = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }
  
  if (req.user.role !== "Teacher" && req.user.role !== "Admin") {
    return next(new ErrorHandler("Access denied. Teacher only.", 403));
  }
  next();
});

// Check if user is student
export const isStudent = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }
  
  if (req.user.role !== "Student" && req.user.role !== "Admin") {
    return next(new ErrorHandler("Access denied. Student only.", 403));
  }
  next();
});

// Logout function - add token to blacklist
export const logoutUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || req.token;
  
  if (token) {
    // Add token to blacklist (optional)
    tokenBlacklist.add(token);
    
    // Optional: Store in database for persistence across server restarts
    // await BlacklistedToken.create({ token, expiresAt: new Date(Date.now() + 7*24*60*60*1000) });
  }
  
  // Clear cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/"
  });
  
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

// Optional: Clean up expired tokens from blacklist (run periodically)
setInterval(() => {
  // This is a simple cleanup - in production, use TTL in database
  if (tokenBlacklist.size > 1000) {
    tokenBlacklist.clear();
  }
}, 24 * 60 * 60 * 1000); // Clear every 24 hours

export default {
  isAuthenticated,
  isAuthenticatedUser,
  authorizeRoles,
  isAuthorized,
  isAdmin,
  isTeacher,
  isStudent,
  logoutUser
};