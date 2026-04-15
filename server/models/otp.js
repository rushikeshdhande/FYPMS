// models/otp.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  userData: {
    name: String,
    email: String,
    password: String,
    role: {
      type: String,
      default: "Student",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // OTP expires after 10 minutes (600 seconds)
  }
});

export const Otp = mongoose.model("Otp", otpSchema);