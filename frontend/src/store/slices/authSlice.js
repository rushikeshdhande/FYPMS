import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from 'react-toastify';  // ✅ Import toast from react-toastify

// ---------- REGISTRATION FLOW ----------
// Step 1: Send OTP
export const sendRegistrationOtp = createAsyncThunk(
  "auth/sendRegistrationOtp",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/auth/register/initiate", data);
      toast.success(res.data.message || "OTP sent to your email");
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send OTP";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Step 2: Verify OTP & Complete Registration
export const verifyRegistrationOtp = createAsyncThunk(
  "auth/verifyRegistrationOtp",
  async ({ email, otp }, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/auth/register/verify", { email, otp });
      toast.success(res.data.message || "Registration successful!");
      return res.data.user;
    } catch (error) {
      const message = error.response?.data?.message || "OTP verification failed";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ---------- LOGIN ----------
export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/auth/login", data);
    toast.success(res.data.message || "Login successful!");
    return res.data.user;
  } catch (error) {
    const message = error.response?.data?.message || "Login failed";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

// ---------- FORGOT PASSWORD ----------
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data, thunkAPI) => {
    try {
      const emailData = typeof data === "string" ? { email: data } : data;
      const res = await axiosInstance.post("/auth/forget-password", emailData);
      toast.success(res.data.message || "Password reset link sent to your email");
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send reset link";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ---------- RESET PASSWORD ----------
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password, confirmPassword }, thunkAPI) => {
    try {
      const cleanToken = token.trim();
      const res = await axiosInstance.put(
        `/auth/reset-password/${cleanToken}`,
        { password, confirmPassword }
      );
      toast.success(res.data.message || "Password reset successful! Please login.");
      return res.data.user;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to reset password";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ---------- GET USER ----------
export const getUser = createAsyncThunk("auth/me", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data.user;
  } catch (error) {
    // Don't show toast for 401 (initial auth check)
    if (error.response?.status !== 401) {
      const message = error.response?.data?.message || "Failed to fetch user data";
      toast.error(message);
    }
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

// ---------- LOGOUT ----------
// In your authSlice.js
export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/auth/logout");
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    // Clear cookies (backend will handle this too)
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    return res.data;
  } catch (error) {
    // Even if API fails, clear local data
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    const message = error.response?.data?.message || "Logged out successfully";
    return thunkAPI.rejectWithValue(message);
  }
});
// ---------- UPDATE PROFILE ----------
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, thunkAPI) => {
    try {
      const res = await axiosInstance.put("/auth/profile", userData);
      toast.success(res.data.message || "Profile updated successfully");
      return res.data.user;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update profile";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ---------- CHANGE PASSWORD ----------
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, thunkAPI) => {
    try {
      const res = await axiosInstance.put("/auth/change-password", passwordData);
      toast.success(res.data.message || "Password changed successfully");
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to change password";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ---------- DELETE ACCOUNT ----------
export const deleteAccount = createAsyncThunk(
  "auth/deleteAccount",
  async (password, thunkAPI) => {
    try {
      const res = await axiosInstance.delete("/auth/account", { data: { password } });
      toast.success(res.data.message || "Account deleted successfully");
      return null;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete account";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ---------- SLICE (keep your existing slice code) ----------
const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isLoggingIn: false,
    isSendingOtp: false,
    isVerifyingOtp: false,
    isUpdatingPassword: false,
    isRequestingForToken: false,
    isCheckingAuth: true,
    registrationEmail: null,
    error: null,
  },
  reducers: {
    logoutReducer: (state) => {
      state.authUser = null;
      state.isLoggingIn = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationEmail: (state) => {
      state.registrationEmail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoggingIn = false;
        state.error = action.payload;
      })
      // Send OTP
      .addCase(sendRegistrationOtp.pending, (state) => {
        state.isSendingOtp = true;
        state.error = null;
      })
      .addCase(sendRegistrationOtp.fulfilled, (state, action) => {
        state.isSendingOtp = false;
        state.registrationEmail = action.meta.arg.email;
      })
      .addCase(sendRegistrationOtp.rejected, (state, action) => {
        state.isSendingOtp = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyRegistrationOtp.pending, (state) => {
        state.isVerifyingOtp = true;
        state.error = null;
      })
      .addCase(verifyRegistrationOtp.fulfilled, (state, action) => {
        state.isVerifyingOtp = false;
        state.authUser = action.payload;
        state.registrationEmail = null;
      })
      .addCase(verifyRegistrationOtp.rejected, (state, action) => {
        state.isVerifyingOtp = false;
        state.error = action.payload;
      })
      // Get User
      .addCase(getUser.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload;
      })
      .addCase(getUser.rejected, (state) => {
        state.isCheckingAuth = false;
        state.authUser = null;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isRequestingForToken = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isRequestingForToken = false;
      })
      .addCase(forgotPassword.rejected, (state) => {
        state.isRequestingForToken = false;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isUpdatingPassword = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
        state.authUser = action.payload;
      })
      .addCase(resetPassword.rejected, (state) => {
        state.isUpdatingPassword = false;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.authUser = action.payload;
      })
      // Delete Account
      .addCase(deleteAccount.fulfilled, (state) => {
        state.authUser = null;
      });
  },
});

export const { logoutReducer, clearError, clearRegistrationEmail } = authSlice.actions;
export default authSlice.reducer;