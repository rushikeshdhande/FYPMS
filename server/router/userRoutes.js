import express from "express";
import {
  registerUser,
  forgetPassword,
  getUser,
  login,
  resetPassword,
  logout,
} from "../controllers/authController.js";

import { isAuthenticatedUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);

router.get("/me", isAuthenticatedUser, getUser);
router.get("/logout", isAuthenticatedUser, logout);

router.post("/password/forgot", forgetPassword);
router.put("/password/reset/:token", resetPassword); // Make sure this is :token param

export default router;