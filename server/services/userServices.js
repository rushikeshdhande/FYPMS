import { User } from "../models/user.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

// Create User
export const createUser = async (userData) => {
  try {
    const user = new User(userData);
    return await user.save();
  } catch (error) {
    throw new Error(error.message || "Error creating user");
  }
};

// Update User
export const updateUser = async (id, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -resetPasswordToken -resetPasswordExpire");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error(`Error updating user: ${error.message || "Unknown error"}`);
  }
};

// Get User By ID
export const getUserById = async (id) => {
  try {
    const user = await User.findById(id).select(
      "-password -resetPasswordToken -resetPasswordExpire",
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message || "Unknown error"}`);
  }
};

// Delete User
export const deleteUser = async (id) => {
  try {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    await user.deleteOne();
    return { message: "User deleted successfully" };
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message || "Unknown error"}`);
  }
};


export const getAllUsers = async () => {
  const query = { role: { $ne: "Admin" } }; // Exclude Admins

  const users = await User.find(query)
    .select("-password -resetPasswordToken -resetPasswordExpire")
    .sort({ createdAt: -1 });

   // console.log("Fetched users:", users); // Debug log


  return users;
};
