import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";

import * as userServices from "../services/userServices.js";

export const createStudent = asyncHandler(async (req, res, next) => {
  const { name, email, password, department } = req.body;

  if (!name || !email || !password || !department) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("User with this email already exists", 400));
  }

  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    role: "Student",
  });

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: "Student created successfully",
    data: { user: userResponse },
  });
});

export const updateStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if user exists and is a student
  const existingUser = await userServices.getUserById(id);
  if (!existingUser) {
    return next(new ErrorHandler("Student not found", 404));
  }

  if (existingUser.role !== "Student") {
    return next(new ErrorHandler("User is not a student", 400));
  }

  const updateData = { ...req.body };
  delete updateData.role; // Prevent role update
  delete updateData.password; // Prevent password update through this endpoint

  const user = await userServices.updateUser(id, updateData);

  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: { user },
  });
});

export const deleteStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if user exists and is a student
  const user = await userServices.getUserById(id);
  if (!user) {
    return next(new ErrorHandler("Student not found", 404));
  }

  if (user.role !== "Student") {
    return next(new ErrorHandler("User is not a student", 400));
  }

  await userServices.deleteUser(id);

  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});

// Create Teacher
export const createTeacher = asyncHandler(async (req, res, next) => {
  const { name, email, password, department, maxStudents, experties } =
    req.body;

  // Fix: Validate maxStudents as a number
  if (
    !name ||
    !email ||
    !password ||
    !department ||
    maxStudents === undefined ||
    !experties
  ) {
    return next(new ErrorHandler("Please provide all fields", 400));
  }

  // Check if maxStudents is a valid number
  if (isNaN(maxStudents) || maxStudents < 1) {
    return next(
      new ErrorHandler(
        "maxStudents must be a valid number greater than 0",
        400,
      ),
    );
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("User with this email already exists", 400));
  }

  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    maxStudents: parseInt(maxStudents), // Ensure it's a number
    experties: Array.isArray(experties)
      ? experties
      : typeof experties === "string" && experties.trim() !== ""
        ? experties.split(",").map((s) => s.trim())
        : [],
    role: "Teacher",
  });

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: "Teacher created successfully",
    data: { user: userResponse },
  });
});

// Update Teacher - FIXED VERSION
export const updateTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if user exists and is a teacher
  const existingUser = await userServices.getUserById(id);
  if (!existingUser) {
    return next(new ErrorHandler("Teacher not found", 404));
  }

  if (existingUser.role !== "Teacher") {
    return next(new ErrorHandler("User is not a teacher", 400));
  }

  // Create update data object
  const updateData = { ...req.body };

  // Remove restricted fields
  delete updateData.role; // Prevent role update
  delete updateData.password; // Prevent password update through this endpoint

  // Process experties if provided
  if (updateData.experties) {
    updateData.experties = Array.isArray(updateData.experties)
      ? updateData.experties
      : typeof updateData.experties === "string" &&
          updateData.experties.trim() !== ""
        ? updateData.experties.split(",").map((s) => s.trim())
        : [];
  }

  // Process maxStudents if provided
  if (updateData.maxStudents !== undefined) {
    if (isNaN(updateData.maxStudents) || updateData.maxStudents < 1) {
      return next(
        new ErrorHandler(
          "maxStudents must be a valid number greater than 0",
          400,
        ),
      );
    }
    updateData.maxStudents = parseInt(updateData.maxStudents);
  }

  const user = await userServices.updateUser(id, updateData);

  res.status(200).json({
    success: true,
    message: "Teacher updated successfully",
    data: { user },
  });
});

export const deleteTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if user exists and is a student
  const user = await userServices.getUserById(id);
  if (!user) {
    return next(new ErrorHandler("Teacher not found", 404));
  }

  if (user.role !== "Teacher") {
    return next(new ErrorHandler("User is not a teacher", 400));
  }

  await userServices.deleteUser(id);

  res.status(200).json({
    success: true,
    message: "Teacher deleted successfully",
  });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await userServices.getAllUsers();
  console.log("Fetched users in controller:", users); // Debug log
  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: { users },
  });
});

export const assignSupervisor = asyncHandler(async (req, res, next) => {});
export const getAllProject = asyncHandler(async (req, res, next) => {});
export const getDashboardStats = asyncHandler(async (req, res, next) => {});
