import express from "express";
const router = express.Router();

import {
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/adminController.js";

import {
  isAuthenticatedUser,
  isAuthorized,
} from "../middlewares/authMiddleware.js";

router.post(
  "/create-student",
  isAuthenticatedUser,
  isAuthorized("Admin"),
  createStudent
);

router.put(
  "/update-student/:id",
  isAuthenticatedUser,
  isAuthorized("Admin"),
  updateStudent
);

router.delete(
  "/delete-student/:id",
  isAuthenticatedUser,
  isAuthorized("Admin"),
  deleteStudent
);

export default router;