import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/auth/login", data, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("Login response:", res.data); // Debug log

    toast.success(res.data.message);
    return res.data.user; // Make sure this contains the role information
  } catch (error) {
    console.error("Login error:", error.response?.data); // Debug log

    toast.error(error.response?.data?.message || "Login failed");
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isUpdatingPassword: false,
    isRequestingForToken: false,
    isCheckingAuth: true,
    error: null, // Add error state for better error handling
  },
  reducers: {
    // Add logout reducer
    logout: (state) => {
      state.authUser = null;
      state.isLoggingIn = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true; // Should be true when pending
        state.error = null;
        // DO NOT set authUser here - it should be null until fulfilled
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload; // Set the user data here
        state.isCheckingAuth = false;
        state.error = null;

        console.log("User stored in Redux:", action.payload); // Debug log
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoggingIn = false;
        state.isCheckingAuth = false;
        state.authUser = null;
        state.error = action.payload; // Store the error message
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;