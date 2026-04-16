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
  forgetPassword,
  resetPassword,
  deleteAccount,
} from "../controllers/authController.js";

import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();


// ================= PUBLIC ROUTES =================

// Registration flow
router.post("/register/initiate", initiateRegistration);
router.post("/register/verify", verifyRegistrationOtp);
router.post("/register/resend-otp", resendOtp);
router.post("/register", registerUser);

// Auth
router.post("/login", login);

// Password reset
router.post("/forget-password", forgetPassword);
router.put("/reset-password/:token", resetPassword);


// ================= PROTECTED ROUTES =================

// ❌ IMPORTANT: logout should NOT be protected
router.post("/logout", logout);
router.get("/logout", logout);

// User
router.get("/me", isAuthenticated, getUser);
router.put("/profile", isAuthenticated, updateProfile);
router.put("/change-password", isAuthenticated, changePassword);
router.delete("/account", isAuthenticated, deleteAccount);


export default router;