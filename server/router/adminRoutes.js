// router/adminRoutes.js
import express from "express";
const router = express.Router();

import {
  createStudent,
  updateStudent,
  deleteStudent,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getAllUsers,
} from "../controllers/adminController.js";

import {
  isAuthenticated,  // Changed from isAuthenticatedUser
  authorizeRoles,   // Changed from isAuthorized
} from "../middlewares/authMiddleware.js";

// Student routes
router.post(
  "/create-student",
  isAuthenticated,
  authorizeRoles("Admin"),
  createStudent
);

router.put(
  "/update-student/:id",
  isAuthenticated,
  authorizeRoles("Admin"),
  updateStudent
);

router.delete(
  "/delete-student/:id",
  isAuthenticated,
  authorizeRoles("Admin"),
  deleteStudent
);

// Teacher routes
router.post(
  "/create-teacher",
  isAuthenticated,
  authorizeRoles("Admin"),
  createTeacher
);

router.put(
  "/update-teacher/:id",
  isAuthenticated,
  authorizeRoles("Admin"),
  updateTeacher
);

router.delete(
  "/delete-teacher/:id",
  isAuthenticated,
  authorizeRoles("Admin"),
  deleteTeacher
);

// Get all users
router.get(
  "/users",
  isAuthenticated,
  authorizeRoles("Admin"),
  getAllUsers
);

export default router;