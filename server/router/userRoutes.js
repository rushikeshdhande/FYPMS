// router/userRoutes.js
import express from "express";
import {
  initiateRegistration,
  verifyRegistrationOtp,
  resendOtp,
  registerUser,
  login,
  logout,  // Make sure this is imported
  logoutSecure, // Optional
  getUser,
  updateProfile,
  changePassword,
  forgetPassword,
  resetPassword,
  deleteAccount,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register/initiate", initiateRegistration);
router.post("/register/verify", verifyRegistrationOtp);
router.post("/register/resend-otp", resendOtp);
router.post("/register", registerUser);
router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.put("/reset-password/:token", resetPassword);

// Protected routes (require authentication)
router.post("/logout", isAuthenticated, logout); // Changed from GET to POST for security
// OR keep GET if preferred
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.put("/profile", isAuthenticated, updateProfile);
router.put("/change-password", isAuthenticated, changePassword);
router.delete("/account", isAuthenticated, deleteAccount);

export default router;