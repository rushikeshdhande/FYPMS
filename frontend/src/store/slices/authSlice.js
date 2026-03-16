import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// login
export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/auth/login", data);

    toast.success(res.data.message);
    return res.data.user;
  } catch (error) {
    const message = error.response?.data?.message || "Login failed";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
}); 
// forget password
export const forgotPassword = createAsyncThunk(
  "auth/password/forgot",
  async (data, thunkAPI) => {  // Changed from 'email' to 'data'
    try {
      // Make sure data is an object with email property
      const emailData = typeof data === 'string' ? { email: data } : data;
      
      const res = await axiosInstance.post("/auth/password/forgot", emailData);

      toast.success(res.data.message || "Password reset link sent");
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send reset link";

      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);
// reset password
export const resetPassword = createAsyncThunk(
  "auth/password/reset",
  async ({ token, password, confirmPassword }, thunkAPI) => {
    try {
      // Make sure token is properly formatted
      const cleanToken = token.trim();
      
      const res = await axiosInstance.put(
        `/auth/password/reset/${cleanToken}`, // Use URL parameter, not query string
        { password, confirmPassword }
      );

      toast.success(res.data.message || "Password reset successfully");
      return res.data.user;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to reset password";

      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
); 
// get user details
export const getUser = createAsyncThunk("auth/me", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data.user;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to fetch user data";

    return thunkAPI.rejectWithValue(message);
  }
}); 
// logout
export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await axiosInstance.get("/auth/logout");
    toast.success("Logged out successfully");
    return null;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to logout";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isLoggingIn: false,
    isUpdatingPassword: false,
    isRequestingForToken: false,
    isCheckingAuth: true,
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
  },

  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoggingIn = false;
        state.error = action.payload;
      })

      // GET USER
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

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
      })

      // FORGOT PASSWORD
      .addCase(forgotPassword.pending, (state) => {
        state.isRequestingForToken = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isRequestingForToken = false;
      })
      .addCase(forgotPassword.rejected, (state) => {
        state.isRequestingForToken = false;
      })

      // RESET PASSWORD
      .addCase(resetPassword.pending, (state) => {
        state.isUpdatingPassword = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
        state.authUser = action.payload;
      })
      .addCase(resetPassword.rejected, (state) => {
        state.isUpdatingPassword = false;
      });
  },
});

export const { logoutReducer, clearError } = authSlice.actions;

export default authSlice.reducer;
 