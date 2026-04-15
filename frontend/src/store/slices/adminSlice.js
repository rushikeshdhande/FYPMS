import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// CREATE STUDENT
export const createStudent = createAsyncThunk(
  "createStudent",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/create-student", data);
      toast.success(res.data.message || "Student created successfully");
      return res.data.data.user;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to create student");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);
/// UPDATE STUDENT
export const updateStudent = createAsyncThunk(
  "updateStudent",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/update-student/${id}`, data);
      toast.success(res.data.message || "Student updated successfully");
      return res.data.data.user;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to update student");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);
/// Delete STUDENT
export const deleteStudent = createAsyncThunk(
  "deleteStudent",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/admin/delete-student/${id}`);
      toast.success(res.data.message || "Student deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to delete student");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

/// Get ALL USERS
export const getAllUsers = createAsyncThunk(
  "getAllUsers",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/users");
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// CREATE TEACHER
export const createTeacher = createAsyncThunk(
  "create-teacher",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/create-teacher", data);
      toast.success(res.data.message || "Teacher created successfully");
      return res.data.data.user;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to create teacher");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

/// UPDATE Teacher
export const updateTeacher = createAsyncThunk(
  "update-teacher",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/update-teacher/${id}`, data);
      toast.success(res.data.message || "Teacher updated successfully");
      return res.data.data.user;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to update teacher");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);
/// Delete TEACHER
export const deleteTeacher = createAsyncThunk(
  "delete-teacher",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/admin/delete-teacher/${id}`);
      toast.success(res.data.message || "Teacher deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete teacher");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// GET ALL PROJECTS
export const getAllProjects = createAsyncThunk(
  "admin/getAllProjects",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/projects");
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// APPROVE PROJECT
export const approveProject = createAsyncThunk(
  "admin/approveProject",
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/admin/projects/${projectId}/approve`,
      );
      toast.success("Project approved");
      return res.data;
    } catch (error) {
      toast.error("Failed to approve project");
      return rejectWithValue(error.response.data);
    }
  },
);

// REJECT PROJECT
export const rejectProject = createAsyncThunk(
  "admin/rejectProject",
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/admin/projects/${projectId}/reject`,
      );
      toast.success("Project rejected");
      return res.data;
    } catch (error) {
      toast.error("Failed to reject project");
      return rejectWithValue(error.response.data);
    }
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    students: [],
    teachers: [],
    projects: [],
    users: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createStudent.fulfilled, (state, action) => {
        if (state.users) state.users.unshift(action.payload);
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.users = state.users?.map((u) =>
          u._id === action.payload._id ? { ...u, ...action.payload } : u,
        );
      })

      .addCase(deleteStudent.fulfilled, (state, action) => {
        if (state.users)
          state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })

      .addCase(createTeacher.fulfilled, (state, action) => {
        if (state.users) state.users.unshift(action.payload);
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        state.users = state.users?.map((u) =>
          u._id === action.payload._id ? { ...u, ...action.payload } : u,
        );
      })

      .addCase(deleteTeacher.fulfilled, (state, action) => {
        if (state.users)
          state.users = state.users.filter((u) => u._id !== action.payload);
      });
  },
});
export default adminSlice.reducer;
