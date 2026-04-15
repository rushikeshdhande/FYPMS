// router/userRoutes.js
import express from "express";
import {
  initiateRegistration,
  verifyRegistrationOtp,
  resendOtp,
  registerUser,
  login,
  logout,
  getUser,
  updateProfile,
  changePassword,
  forgetPassword,  // Make sure this is imported
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
router.post("/forget-password", forgetPassword);  // ✅ This is the correct route
router.put("/reset-password/:token", resetPassword);

// Protected routes
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.put("/profile", isAuthenticated, updateProfile);
router.put("/change-password", isAuthenticated, changePassword);
router.delete("/account", isAuthenticated, deleteAccount);

export default router;