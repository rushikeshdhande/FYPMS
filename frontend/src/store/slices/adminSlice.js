import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
 

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
  }
);

// APPROVE PROJECT
export const approveProject = createAsyncThunk(
  "admin/approveProject",
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/admin/projects/${projectId}/approve`);
      toast.success("Project approved");
      return res.data;
    } catch (error) {
      toast.error("Failed to approve project");
      return rejectWithValue(error.response.data);
    }
  }
);

// REJECT PROJECT
export const rejectProject = createAsyncThunk(
  "admin/rejectProject",
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/admin/projects/${projectId}/reject`);
      toast.success("Project rejected");
      return res.data;
    } catch (error) {
      toast.error("Failed to reject project");
      return rejectWithValue(error.response.data);
    }
  }
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
  extraReducers: (builder) => {},
});

export default adminSlice.reducer;